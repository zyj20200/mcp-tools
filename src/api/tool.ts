import { POST } from '@fastgpt/web/core/request';
import { type McpToolConfigType } from '@fastgpt/global/core/app/tool/mcpTool/type';
import { type StoreSecretValueType } from '@fastgpt/global/common/secret/type';

export type getMCPToolsBody = {
  url: string;
  headerSecret: StoreSecretValueType;
};

export const getMCPTools = (data: getMCPToolsBody) =>
  POST<McpToolConfigType[]>('/support/mcp/client/getTools', data);

export const runMCPTool = (data: {
  url: string;
  headerSecret: StoreSecretValueType;
  toolName: string;
  args: Record<string, any>;
}) => POST<string>('/support/mcp/client/runTool', data);
