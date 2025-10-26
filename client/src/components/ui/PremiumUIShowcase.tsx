import React, { useState } from 'react';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import PremiumButton from './PremiumButton';
import PremiumCard from './PremiumCard';
import PremiumInput from './PremiumInput';
import { Container, Grid, Flex } from './Layout';

/**
 * Premium UI Showcase Component
 * Demonstrates all premium UI components working together
 */
const PremiumUIShowcase: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setShowSuccess(true);
      setShowError(false);
    } else {
      setShowError(true);
      setShowSuccess(false);
    }
  };

  return (
    <Container maxWidth="xl" className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-heading-1 mb-4">Premium UI Component Library</h1>
        <p className="text-body-large text-neutral-600 max-w-2xl mx-auto">
          A comprehensive collection of premium UI components built with modern design principles
          and accessibility in mind.
        </p>
      </div>

      {/* Button Variants Section */}
      <PremiumCard elevation="medium" padding="lg" className="mb-8">
        <h2 className="text-heading-3 mb-6">Premium Buttons</h2>
        <Grid cols={2} gap="md" className="mb-6">
          <div>
            <h3 className="text-heading-4 mb-4">Variants</h3>
            <Flex direction="col" gap="sm">
              <PremiumButton variant="primary">Primary Button</PremiumButton>
              <PremiumButton variant="secondary">Secondary Button</PremiumButton>
              <PremiumButton variant="outline">Outline Button</PremiumButton>
              <PremiumButton variant="ghost">Ghost Button</PremiumButton>
            </Flex>
          </div>
          <div>
            <h3 className="text-heading-4 mb-4">Sizes & States</h3>
            <Flex direction="col" gap="sm">
              <PremiumButton size="sm" icon={<Heart className="w-4 h-4" />}>
                Small with Icon
              </PremiumButton>
              <PremiumButton size="md" loading>
                Loading State
              </PremiumButton>
              <PremiumButton size="lg" fullWidth>
                Large Full Width
              </PremiumButton>
              <PremiumButton disabled>Disabled Button</PremiumButton>
            </Flex>
          </div>
        </Grid>
      </PremiumCard>

      {/* Card Variants Section */}
      <div className="mb-8">
        <h2 className="text-heading-3 mb-6">Premium Cards</h2>
        <Grid cols={3} gap="md">
          <PremiumCard elevation="low" padding="md">
            <h3 className="text-heading-4 mb-2">Low Elevation</h3>
            <p className="text-body-small">Subtle shadow for minimal emphasis</p>
          </PremiumCard>
          <PremiumCard elevation="medium" padding="md" hover>
            <h3 className="text-heading-4 mb-2">Medium with Hover</h3>
            <p className="text-body-small">Interactive card with hover effects</p>
          </PremiumCard>
          <PremiumCard elevation="high" padding="md">
            <h3 className="text-heading-4 mb-2">High Elevation</h3>
            <p className="text-body-small">Prominent shadow for emphasis</p>
          </PremiumCard>
        </Grid>
      </div>

      {/* Input Components Section */}
      <PremiumCard elevation="medium" padding="lg" className="mb-8">
        <h2 className="text-heading-3 mb-6">Premium Inputs</h2>
        <Grid cols={2} gap="lg">
          <div>
            <h3 className="text-heading-4 mb-4">Input Variants</h3>
            <Flex direction="col" gap="md">
              <PremiumInput
                label="Default Input"
                placeholder="Enter your text..."
                helperText="This is a helper text"
              />
              <PremiumInput
                label="Input with Icon"
                placeholder="Search..."
                icon={<Search className="w-4 h-4" />}
              />
              <PremiumInput
                label="Success State"
                value="Valid input"
                variant="success"
                success="Input is valid!"
                readOnly
              />
              <PremiumInput
                label="Error State"
                value="Invalid input"
                variant="error"
                error="This field is required"
                readOnly
              />
            </Flex>
          </div>
          <div>
            <h3 className="text-heading-4 mb-4">Interactive Example</h3>
            <Flex direction="col" gap="md">
              <PremiumInput
                label="Test Input"
                placeholder="Type something..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                variant={showError ? 'error' : showSuccess ? 'success' : 'default'}
                error={showError ? 'Input cannot be empty' : undefined}
                success={showSuccess ? 'Input is valid!' : undefined}
                helperText="Try typing something and clicking submit"
              />
              <PremiumButton onClick={handleSubmit} icon={<ShoppingCart className="w-4 h-4" />}>
                Submit Test
              </PremiumButton>
            </Flex>
          </div>
        </Grid>
      </PremiumCard>

      {/* Layout Components Section */}
      <PremiumCard elevation="medium" padding="lg">
        <h2 className="text-heading-3 mb-6">Layout Components</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-heading-4 mb-4">Flex Layout</h3>
            <Flex justify="between" align="center" className="bg-neutral-100 p-4 rounded-lg">
              <span className="text-body">Left Content</span>
              <span className="text-body">Center Content</span>
              <span className="text-body">Right Content</span>
            </Flex>
          </div>
          <div>
            <h3 className="text-heading-4 mb-4">Grid Layout</h3>
            <Grid cols={4} gap="sm">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bg-primary-100 p-4 rounded-lg text-center text-body-small">
                  Item {i + 1}
                </div>
              ))}
            </Grid>
          </div>
        </div>
      </PremiumCard>
    </Container>
  );
};

export default PremiumUIShowcase;