'use client';

import { Component, type ReactNode } from 'react';
import { Card, Flex, Heading, Text, Button } from '@radix-ui/themes';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-6">
          <Flex direction="column" align="center" gap="4">
            <Heading size="4" color="red">Something went wrong</Heading>
            <Text color="gray">{this.state.error?.message}</Text>
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </Button>
          </Flex>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Query Error Component
export function QueryError({
  error,
  retry,
}: {
  error: { message: string };
  retry?: () => void;
}) {
  return (
    <Card className="p-6">
      <Flex direction="column" align="center" gap="4">
        <Heading size="4" color="red">Error loading data</Heading>
        <Text color="gray" size="2">{error.message}</Text>
        {retry && (
          <Button variant="outline" onClick={retry}>
            Try again
          </Button>
        )}
      </Flex>
    </Card>
  );
}

// Mutation Error Component
export function MutationError({
  error,
  onDismiss,
}: {
  error: { message: string };
  onDismiss?: () => void;
}) {
  return (
    <Card className="border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
      <Flex align="center" justify="between">
        <Text color="red" size="2">{error.message}</Text>
        {onDismiss && (
          <Button variant="ghost" size="1" onClick={onDismiss}>
            ×
          </Button>
        )}
      </Flex>
    </Card>
  );
}
