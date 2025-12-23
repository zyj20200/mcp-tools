import { Box, Button, Flex, Input } from '@chakra-ui/react';
import React from 'react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import { useTranslation } from 'next-i18next';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { type McpToolConfigType } from '@fastgpt/global/core/app/tool/mcpTool/type';
import { type StoreSecretValueType } from '@fastgpt/global/common/secret/type';
import { getMCPTools } from '@/api/tool';

const EditForm = ({
  url,
  setUrl,
  toolList,
  setToolList,
  currentTool,
  setCurrentTool,
  headerSecret,
  setHeaderSecret
}: {
  url: string;
  setUrl: (url: string) => void;
  toolList: McpToolConfigType[];
  setToolList: (toolList: McpToolConfigType[]) => void;
  currentTool?: McpToolConfigType;
  setCurrentTool: (tool: McpToolConfigType) => void;
  headerSecret: StoreSecretValueType;
  setHeaderSecret: (headerSecret: StoreSecretValueType) => void;
}) => {
  const { t } = useTranslation();

  const { runAsync: runGetMCPTools, loading: isGettingTools } = useRequest2(
    async () => await getMCPTools({ url, headerSecret }),
    {
      onSuccess: (res) => {
        setToolList(res);
        setCurrentTool(res[0]);
      },
      errorToast: 'MCP 工具解析失败'
    }
  );

  return (
    <Box p={6}>
      <Flex alignItems={'center'}>
        <MyIcon name={'common/linkBlue'} w={'20px'} />
        <FormLabel ml={2} flex={1}>
          MCP Server 地址
        </FormLabel>
      </Flex>
      <Flex alignItems={'center'} gap={2} mt={3}>
        <Input
          h={8}
          placeholder={'请输入 MCP Server 地址'}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button
          size={'sm'}
          variant={'whitePrimary'}
          h={8}
          isLoading={isGettingTools}
          onClick={() => {
            runGetMCPTools();
          }}
        >
          解析
        </Button>
      </Flex>

      <Flex alignItems={'center'} mt={6}>
        <MyIcon name={'common/list'} w={'20px'} color={'primary.600'} />
        <FormLabel ml={2} flex={1}>
          工具列表 ({toolList.length})
        </FormLabel>
      </Flex>

      <Box mt={3}>
        {toolList.map((tool, index) => (
          <Flex
            key={index}
            alignItems={'center'}
            p={2}
            cursor={'pointer'}
            borderRadius={'md'}
            _hover={{ bg: 'myGray.100' }}
            bg={currentTool?.name === tool.name ? 'myGray.100' : 'transparent'}
            onClick={() => setCurrentTool(tool)}
          >
            <Box flex={1} fontWeight={'bold'}>
              {tool.name}
            </Box>
            <Box fontSize={'xs'} color={'myGray.500'}>
              {tool.description}
            </Box>
          </Flex>
        ))}
      </Box>
    </Box>
  );
};

export default EditForm;
