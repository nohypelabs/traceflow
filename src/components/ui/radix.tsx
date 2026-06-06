'use client';

import {
  Button as RadixButton,
  Card as RadixCard,
  Badge as RadixBadge,
  Avatar as RadixAvatar,
  Text,
  Heading,
  DropdownMenu,
  Dialog,
  Tooltip,
  Select,
  TextField,
  TextArea,
  Switch,
  Checkbox,
  RadioGroup,
  Tabs,
  Separator,
  Flex,
  Box,
  Grid,
  Container,
  Section,
} from '@radix-ui/themes';

// Re-export Radix components with consistent naming
export {
  RadixButton as Button,
  RadixCard as Card,
  RadixBadge as Badge,
  RadixAvatar as Avatar,
  Text,
  Heading,
  DropdownMenu,
  Dialog,
  Tooltip,
  Select,
  TextField,
  TextArea,
  Switch,
  Checkbox,
  RadioGroup,
  Tabs,
  Separator,
  Flex,
  Box,
  Grid,
  Container,
  Section,
};

// Stat Card component using Radix
export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
}) {
  return (
    <RadixCard className="p-4">
      <Flex align="center" justify="between" mb="2">
        <Text size="2" color="gray">
          {title}
        </Text>
        {icon}
      </Flex>
      <Heading size="6" color={color}>
        {value}
      </Heading>
      {subtitle && (
        <Text size="1" color="gray" mt="1">
          {subtitle}
        </Text>
      )}
    </RadixCard>
  );
}

// Alert Card component using Radix
export function AlertCard({
  title,
  message,
  severity = 'info',
  timestamp,
  onDismiss,
}: {
  title: string;
  message: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
  timestamp?: string;
  onDismiss?: () => void;
}) {
  const colorMap = {
    info: 'blue',
    warning: 'yellow',
    error: 'red',
    success: 'green',
  } as const;

  return (
    <RadixCard className="p-4">
      <Flex align="start" gap="3">
        <RadixBadge color={colorMap[severity]} variant="soft">
          {severity.toUpperCase()}
        </RadixBadge>
        <Box className="flex-1">
          <Heading size="3">{title}</Heading>
          <Text size="2" color="gray" mt="1">
            {message}
          </Text>
          {timestamp && (
            <Text size="1" color="gray" mt="2">
              {timestamp}
            </Text>
          )}
        </Box>
        {onDismiss && (
          <RadixButton
            variant="ghost"
            size="1"
            onClick={onDismiss}
          >
            ×
          </RadixButton>
        )}
      </Flex>
    </RadixCard>
  );
}

// Device Status Badge
export function DeviceStatusBadge({
  status,
}: {
  status: 'ONLINE' | 'OFFLINE' | 'IDLE';
}) {
  const colorMap = {
    ONLINE: 'green',
    OFFLINE: 'gray',
    IDLE: 'yellow',
  } as const;

  return (
    <RadixBadge color={colorMap[status]} variant="soft">
      {status}
    </RadixBadge>
  );
}
