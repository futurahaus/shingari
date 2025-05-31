import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('should render the Banner and ProductGrid mocks', () => {
    render(<Home />);

    expect(screen.getByTestId('banner')).toBeInTheDocument();
    expect(screen.getByTestId('product-grid')).toBeInTheDocument();
  });

  it('should render the main container', () => {
    render(<Home />);
    expect(screen.getByTestId('home-container')).toBeInTheDocument();
  });
}); 