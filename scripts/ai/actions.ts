import { neo } from "@yao/runtime";

export namespace actions {
  export const Done = (namespace: string, field: neo.Field): neo.Action => {
    return {
      name: "Done",
      type: "Common.emitEvent",
      payload: { key: `${namespace}/${field.bind}/unloading` },
    };
  };

  export const SetFieldsValue = (
    namespace: string,
    values: Record<string, any>
  ): neo.Action => {
    return {
      name: "SetFieldsValue",
      type: "Common.emitEvent",
      payload: { key: `${namespace}/setFieldsValue`, value: values },
    };
  };

  export const setNeoVisible = (
    visible: boolean,
    placeholder?: string,
    signal?: any
  ): neo.Action => {
    return {
      name: "SetNeoVisible",
      type: "Common.emitEvent",
      payload: {
        key: `app/setNeoVisible`,
        value: { visible, placeholder, signal },
      },
    };
  };
}
