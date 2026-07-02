/**
 * CommunityCard Component Tests
 * Tests UI rendering, accessibility, badges, and user interaction.
 */

import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {CommunityCard} from '../components/CommunityCard';
import {Community} from '../types';

// Mock the useTheme hook
const mockTheme = {
  colors: {
    card: '#ffffff',
    border: '#cccccc',
    shadow: '#000000',
    surfaceVariant: '#f0f0f0',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#6200ee',
    success: '#00c853',
    successLight: '#e8f5e9',
  },
  typography: {
    h3: {fontSize: 16, fontWeight: 'bold'},
    bodySmall: {fontSize: 14},
    caption: {fontSize: 12},
  },
  spacing: {
    md: 16,
  },
  borderRadius: {
    lg: 12,
    md: 8,
    sm: 4,
    xs: 2,
  },
};

jest.mock('../../../theme', () => ({
  useTheme: () => mockTheme,
}));

const mockCommunity: Community = {
  id: 'community_1',
  name: 'React Native Developers',
  description: 'A global community of React Native developers sharing tips, news and job openings.',
  members: 15400,
  isPrivate: false,
  isJoined: false,
  image: 'https://example.com/logo.png',
  createdAt: new Date().toISOString(),
};

describe('CommunityCard', () => {
  it('renders title, description and member count correctly', () => {
    const {getByText} = render(
      <CommunityCard community={mockCommunity} onPress={jest.fn()} />
    );

    expect(getByText('React Native Developers')).toBeTruthy();
    expect(getByText('A global community of React Native developers sharing tips, news and job openings.')).toBeTruthy();
    expect(getByText('15,400 members')).toBeTruthy();
  });

  it('calls onPress with community id when clicked', () => {
    const onPressMock = jest.fn();
    const {getByRole} = render(
      <CommunityCard community={mockCommunity} onPress={onPressMock} />
    );

    const card = getByRole('button');
    fireEvent.press(card);

    expect(onPressMock).toHaveBeenCalledWith('community_1');
  });

  it('displays the Private badge when community is private', () => {
    const privateCommunity = {...mockCommunity, isPrivate: true};
    const {getByText} = render(
      <CommunityCard community={privateCommunity} onPress={jest.fn()} />
    );

    expect(getByText('Private')).toBeTruthy();
  });

  it('displays the Joined badge when user is a member', () => {
    const joinedCommunity = {...mockCommunity, isJoined: true};
    const {getByText} = render(
      <CommunityCard community={joinedCommunity} onPress={jest.fn()} />
    );

    expect(getByText('Joined')).toBeTruthy();
  });

  it('does not display Private or Joined badges by default', () => {
    const {queryByText} = render(
      <CommunityCard community={mockCommunity} onPress={jest.fn()} />
    );

    expect(queryByText('Private')).toBeNull();
    expect(queryByText('Joined')).toBeNull();
  });
});
