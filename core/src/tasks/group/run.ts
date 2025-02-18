import { CLSTask } from "../../classes/tasks/clsTask";
import { Group } from "../../models/Group";
import { Run } from "../../models/Run";
import { plugin } from "../../modules/plugin";

export class RunGroup extends CLSTask {
  constructor() {
    super();
    this.name = "group:run";
    this.description =
      "calculate the groups members and create imports to update them all";
    this.frequency = 0;
    this.plugins = ["QueueLock"];
    this.queue = "groups";
    this.inputs = {
      runId: { required: true },
    };
  }

  async runWithinTransaction(params) {
    // 1. Calculate the set of profiles that should be in this group, with a limit and offset (looping)
    // 2. Find or create GroupMembers, touch the updatedAt for those that already exist. (group#runAddGroupMembers)
    //    > Create imports for new profiles
    // 3. After the loop is done, loop thought those GroupMembers who have not had their updatedAt touched.  (group#runRemoveGroupMembers)
    //    > Create imports for those profiles whose last update is older than the run's start time to remove them
    // 4. Delete any group members still hanging around from a pervious run that this run may have canceled

    const run = await Run.scope(null).findOne({ where: { id: params.runId } });
    if (!run) return;
    if (run.state === "stopped") return;
    const group = await Group.scope(null).findOne({
      where: { id: run.creatorId },
    });
    if (!group) return;

    const force = run.force || false;
    const destinationId = run.destinationId;
    const method = run.groupMethod || "runAddGroupMembers";
    const highWaterMark: number = run.groupHighWaterMark || 0;
    const offset: number = run.groupMemberOffset || 0;
    const limit: number =
      run.groupMemberLimit ||
      parseInt(
        (await plugin.readSetting("core", "runs-profile-batch-size")).value
      );

    let groupMembersCount = 0;
    let nextHighWaterMark = 0;
    let nextOffset = 0;

    if (method === "runAddGroupMembers") {
      const response = await group.runAddGroupMembers(
        run,
        limit,
        offset,
        highWaterMark,
        force,
        destinationId
      );

      groupMembersCount = response.groupMembersCount;
      nextHighWaterMark = response.nextHighWaterMark;
      nextOffset = response.nextOffset;
    } else if (method === "runRemoveGroupMembers") {
      groupMembersCount = await group.runRemoveGroupMembers(
        run,
        limit,
        destinationId
      );
    } else if (method === "removePreviousRunGroupMembers") {
      groupMembersCount = await group.removePreviousRunGroupMembers(run, limit);
    } else if (method === "complete") {
      // waiting for imports...
    } else {
      throw new Error(`${method} is not now a known method`);
    }

    let nextMethod = method;
    if (groupMembersCount === 0) {
      if (method === "runAddGroupMembers") {
        nextMethod = "runRemoveGroupMembers";
      } else if (method === "runRemoveGroupMembers") {
        nextMethod = "removePreviousRunGroupMembers";
      } else if (method === "removePreviousRunGroupMembers") {
        nextMethod = "complete";
      }
    }

    await run.update({
      groupMemberLimit: limit,
      groupMemberOffset: nextOffset,
      groupHighWaterMark: nextHighWaterMark,
      groupMethod: nextMethod,
      force,
    });

    const pendingImports = await run.$count("imports", {
      where: { groupsUpdatedAt: null },
    });

    // we don't want to denote the group as ready until all the imports are imported
    if (
      method === "complete" &&
      pendingImports === 0 &&
      groupMembersCount === 0
    ) {
      await run.afterBatch("complete");
      if (group.state !== "deleted") {
        await group.update({ state: "ready" });
      }
    } else {
      await run.afterBatch();
    }

    return groupMembersCount;
  }
}
