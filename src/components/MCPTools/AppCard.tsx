import { Box, Flex } from '@chakra-ui/react';
import React from 'react';
import Avatar from '@fastgpt/web/components/common/Avatar';
import { useTranslation } from 'next-i18next';

const AppCard = () => {
  const { t } = useTranslation();

  return (
    <Box px={[4, 6]} py={4} position={'relative'}>
      <Flex alignItems={'center'}>
        <Avatar src={'/imgs/app/mcpToolsPreview.svg'} borderRadius={'md'} w={'28px'} />
        <Box ml={3} fontWeight={'bold'} fontSize={'md'} flex={'1 0 0'} color={'myGray.900'}>
          MCP 工具测试台
        </Box>
      </Flex>
      <Box
        flex={1}
        mt={3}
        mb={4}
        className={'textEllipsis3'}
        wordBreak={'break-all'}
        color={'myGray.600'}
        fontSize={'xs'}
        minH={'46px'}
      >
        输入 MCP Server 地址，解析并测试工具。
      </Box>
    </Box>
  );
};

export default React.memo(AppCard);
