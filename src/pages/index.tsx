import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Edit from '@/components/MCPTools/Edit';
import { type McpToolConfigType } from '@fastgpt/global/core/app/tool/mcpTool/type';
import { type StoreSecretValueType } from '@fastgpt/global/common/secret/type';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const MCPToolsPage = () => {
  const [url, setUrl] = useState('');
  const [toolList, setToolList] = useState<McpToolConfigType[]>([]);
  const [headerSecret, setHeaderSecret] = useState<StoreSecretValueType>({});
  const [currentTool, setCurrentTool] = useState<McpToolConfigType | undefined>();

  return (
    <Flex h={'100vh'} flexDirection={'column'} p={4}>
      <Box mb={4} fontSize={'xl'} fontWeight={'bold'}>
        MCP 工具测试台
      </Box>
      <Edit
        url={url}
        setUrl={setUrl}
        toolList={toolList}
        setToolList={setToolList}
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        headerSecret={headerSecret}
        setHeaderSecret={setHeaderSecret}
      />
    </Flex>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'app', 'workflow'])),
    },
  };
}

export default MCPToolsPage;
