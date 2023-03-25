import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App demo={true}/>);
  const linkElement = screen.getByText(/MoneyDashboard Report/i);
  expect(linkElement).toBeInTheDocument();
});
