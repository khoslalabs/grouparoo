import { useApi } from "@grouparoo/ui-components/hooks/useApi";
import { useState } from "react";
import { Form } from "react-bootstrap";
import Head from "next/head";
import PermissionsList from "@grouparoo/ui-components/components/permissions";
import { useRouter } from "next/router";
import ApiKeyTabs from "@grouparoo/ui-components/components/tabs/apiKey";
import LoadingButton from "@grouparoo/ui-components/components/loadingButton";
import LockedBadge from "@grouparoo/ui-components/components/badges/lockedBadge";

import { Models, Actions } from "@grouparoo/ui-components/utils/apiData";

export default function Page(props) {
  const { errorHandler, successHandler } = props;
  const router = useRouter();
  const { execApi } = useApi(props, errorHandler);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<Models.ApiKeyType>(props.apiKey);
  const { id } = router.query;

  const updateApiKey = async (event) => {
    event.preventDefault();
    const _apiKey = Object.assign({}, apiKey);
    delete _apiKey.apiKey;

    if (_apiKey.permissionAllRead === null) {
      _apiKey["disabledPermissionAllRead"] = true;
    }
    if (_apiKey.permissionAllWrite === null) {
      _apiKey["disabledPermissionAllWrite"] = true;
    }

    setLoading(true);
    const response: Actions.ApiKeyEdit = await execApi(
      "put",
      `/apiKey/${id}`,
      _apiKey
    );
    if (response?.apiKey) {
      successHandler.set({ message: "API Key updated" });
      setApiKey(response.apiKey);
    }
    setLoading(false);
  };

  async function handleDelete() {
    if (window.confirm("are you sure?")) {
      const { success }: Actions.ApiKeyDestroy = await execApi(
        "delete",
        `/apiKey/${id}`
      );
      if (success) {
        successHandler.set({ message: "API Key deleted" });
        router.push("/apiKeys");
      } else {
        setLoading(false);
      }
    }
  }

  function updatePermission(topic, read, write) {
    const _apiKey = Object.assign({}, apiKey);
    _apiKey.permissionAllRead = null;
    _apiKey.permissionAllWrite = null;
    for (const i in _apiKey.permissions) {
      if (_apiKey.permissions[i].topic === topic) {
        _apiKey.permissions[i].read = read;
        _apiKey.permissions[i].write = write;
      }
    }
    setApiKey(_apiKey);
  }

  function updatePermissionAll(read, write) {
    const _apiKey = Object.assign({}, apiKey);
    _apiKey.permissionAllRead = read;
    _apiKey.permissionAllWrite = write;
    for (const i in _apiKey.permissions) {
      _apiKey.permissions[i].read = read;
      _apiKey.permissions[i].write = write;
    }
    setApiKey(_apiKey);
  }

  return (
    <>
      <Head>
        <title>Grouparoo: {apiKey.name}</title>
      </Head>

      <ApiKeyTabs apiKey={apiKey} />

      <h1>{apiKey.name}</h1>
      <LockedBadge object={apiKey} />
      <Form id="form" onSubmit={updateApiKey} autoComplete="off">
        <fieldset disabled={apiKey.locked !== null}>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="API Key Name"
              disabled={loading}
              value={apiKey.name}
              onChange={(event) => {
                const _apiKey = Object.assign({}, apiKey);
                _apiKey.name = event.target.value;
                setApiKey(_apiKey);
              }}
            />
            <Form.Control.Feedback type="invalid">
              Name is required
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>API Key</Form.Label>
            <Form.Control
              disabled
              type="text"
              placeholder="API Key"
              value={apiKey.apiKey}
            />
          </Form.Group>

          <p>
            Try this API Key in the browser{" "}
            <a
              href={`/public/@grouparoo/examples/events.html?apiKey=${apiKey.apiKey}`}
              target="_new"
            >
              here
            </a>
            .
          </p>

          <h3>Permissions</h3>
          <PermissionsList
            permissions={apiKey.permissions}
            permissionAllRead={apiKey.permissionAllRead}
            permissionAllWrite={apiKey.permissionAllWrite}
            updatePermission={updatePermission}
            updatePermissionAll={updatePermissionAll}
          />

          <hr />

          <LoadingButton variant="primary" type="submit" disabled={loading}>
            Update
          </LoadingButton>

          <br />
          <br />

          <LoadingButton
            disabled={loading}
            variant="danger"
            size="sm"
            onClick={() => {
              handleDelete();
            }}
          >
            Delete
          </LoadingButton>
        </fieldset>
      </Form>
    </>
  );
}

Page.getInitialProps = async (ctx) => {
  const { execApi } = useApi(ctx);
  const { id } = ctx.query;
  const { apiKey }: Actions.ApiKeyView = await execApi("get", `/apiKey/${id}`);
  return { apiKey };
};
