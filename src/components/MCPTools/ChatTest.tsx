import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Input, Textarea } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { type McpToolConfigType } from '@fastgpt/global/core/app/tool/mcpTool/type';
import { useForm } from 'react-hook-form';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { runMCPTool } from '@/api/tool';
import { type StoreSecretValueType } from '@fastgpt/global/common/secret/type';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';

const ChatTest = ({
  currentTool,
  url,
  headerSecret
}: {
  currentTool?: McpToolConfigType;
  url: string;
  headerSecret: StoreSecretValueType;
}) => {
  const { t } = useTranslation();
  const [output, setOutput] = useState<string>('');
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    reset({});
    setOutput('');
  }, [currentTool, reset]);

  const { runAsync: runTool, loading: isRunning } = useRequest2(
    async (data: Record<string, any>) => {
      if (!currentTool) return;
      return await runMCPTool({
        args: data,
        url,
        headerSecret,
        toolName: currentTool.name
      });
    },
    {
      onSuccess: (res) => {
        try {
          const resStr = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
          setOutput(resStr);
        } catch (error) {
          console.error(error);
          setOutput(String(res));
        }
      }
    }
  );

  if (!currentTool) {
    return <Box p={4}>请选择一个工具进行测试</Box>;
  }

  return (
    <Flex h={'full'} gap={4} flexDirection={'column'}>
      <Box
        flex={'1 0 0'}
        display={'flex'}
        flexDirection={'column'}
        p={4}
        borderRadius={'lg'}
        bg={'white'}
        boxShadow={'sm'}
        overflow={'auto'}
      >
        <Box fontSize={'lg'} fontWeight={'bold'} mb={4}>
          参数配置
        </Box>
        <form onSubmit={handleSubmit((data) => runTool(data))}>
          {Object.entries(currentTool.inputSchema.properties || {}).map(([key, schema]: [string, any]) => (
            <Box key={key} mb={4}>
              <FormLabel mb={1}>
                {key} {schema.description && `(${schema.description})`}
                {currentTool.inputSchema.required?.includes(key) && <span style={{ color: 'red' }}>*</span>}
              </FormLabel>
              <Input {...register(key, { required: currentTool.inputSchema.required?.includes(key) })} />
            </Box>
          ))}
          <Button type="submit" isLoading={isRunning} mt={2}>
            运行
          </Button>
        </form>
      </Box>

      <Box
        flex={'1 0 0'}
        display={'flex'}
        flexDirection={'column'}
        p={4}
        borderRadius={'lg'}
        bg={'white'}
        boxShadow={'sm'}
        overflow={'auto'}
      >
        <Box fontSize={'lg'} fontWeight={'bold'} mb={4}>
          运行结果
        </Box>
        <Textarea value={output} readOnly h={'full'} fontFamily={'monospace'} />
      </Box>
    </Flex>
  );
};

export default ChatTest;
