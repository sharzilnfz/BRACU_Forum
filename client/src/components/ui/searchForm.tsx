import {
  ActionIcon,
  TextInput,
  TextInputProps,
  useMantineTheme,
} from '@mantine/core';
import { IconArrowRight, IconSearch } from '@tabler/icons-react';
import * as React from 'react';

export function InputWithButton(props: TextInputProps) {
  const theme = useMantineTheme();

  return (
    <TextInput
      radius="xl"
      size="md"
      placeholder="Search questions"
      rightSectionWidth={42}
      leftSection={<IconSearch size={18} stroke={1.5} />}
      rightSection={
        <ActionIcon
          size={32}
          radius="xl"
          variant="transparent"
          className="bg-black hover:bg-black/80 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black flex items-center justify-center transition-colors"
        >
          <IconArrowRight size={18} stroke={1.5} />
        </ActionIcon>
      }
      {...props}
    />
  );
}
