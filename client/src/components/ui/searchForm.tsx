import {
  ActionIcon,
  TextInput,
  TextInputProps,
  useMantineTheme,
} from '@mantine/core';
import { IconArrowRight, IconSearch } from '@tabler/icons-react';
import * as React from 'react';

interface InputWithButtonProps extends TextInputProps {
  onSearch?: (query: string) => void;
}

export function InputWithButton({ onSearch, ...props }: InputWithButtonProps) {
  const _theme = useMantineTheme();
  const [value, setValue] = React.useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.value;
    setValue(newValue);
    onSearch?.(newValue);
  };

  return (
    <TextInput
      radius="xl"
      size="md"
      placeholder="Search questions"
      value={value}
      onChange={handleChange}
      rightSectionWidth={42}
      leftSection={<IconSearch size={18} stroke={1.5} />}
      rightSection={
        <ActionIcon
          size={32}
          radius="xl"
          variant="transparent"
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors"
        >
          <IconArrowRight size={18} stroke={1.5} />
        </ActionIcon>
      }
      {...props}
    />
  );
}
