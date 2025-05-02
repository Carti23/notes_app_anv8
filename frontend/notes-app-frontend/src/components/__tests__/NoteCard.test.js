import React from 'react';
import { render, screen, fireEvent } from '../../../test-utils';
import NoteCard from '../NoteCard';

describe('NoteCard Component', () => {
  const mockProps = {
    title: 'Test Note',
    content: 'Test Content',
    timestamp: '2024-04-22 10:00',
    onShare: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders note card with all props correctly', () => {
    render(<NoteCard {...mockProps} />);
    
    // Check if title is rendered
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    
    // Check if content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Check if timestamp is rendered
    expect(screen.getByText('2024-04-22 10:00')).toBeInTheDocument();
    
    // Check if action buttons are rendered
    expect(screen.getByLabelText('Share note')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit note')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete note')).toBeInTheDocument();
  });

  it('renders note card without content when content prop is not provided', () => {
    const propsWithoutContent = { ...mockProps, content: null };
    render(<NoteCard {...propsWithoutContent} />);
    
    // Check if title is still rendered
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    
    // Check that content paragraph is not rendered
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('calls onShare when share button is clicked', () => {
    render(<NoteCard {...mockProps} />);
    
    const shareButton = screen.getByLabelText('Share note');
    fireEvent.click(shareButton);
    
    expect(mockProps.onShare).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<NoteCard {...mockProps} />);
    
    const editButton = screen.getByLabelText('Edit note');
    fireEvent.click(editButton);
    
    expect(mockProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it('opens delete modal when delete button is clicked', () => {
    render(<NoteCard {...mockProps} />);
    
    const deleteButton = screen.getByLabelText('Delete note');
    fireEvent.click(deleteButton);
    
    // Check if delete modal is opened
    expect(screen.getByText('Delete Note')).toBeInTheDocument();
    expect(screen.getByText(`Are you sure you want to delete "${mockProps.title}"?`)).toBeInTheDocument();
  });

  it('calls onDelete and closes modal when delete is confirmed', () => {
    render(<NoteCard {...mockProps} />);
    
    // Open delete modal
    const deleteButton = screen.getByLabelText('Delete note');
    fireEvent.click(deleteButton);
    
    // Click confirm delete button
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);
    
    // Check if onDelete was called
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
    
    // Check if modal is closed
    expect(screen.queryByText('Delete Note')).not.toBeInTheDocument();
  });

  it('closes delete modal when cancel is clicked', () => {
    render(<NoteCard {...mockProps} />);
    
    // Open delete modal
    const deleteButton = screen.getByLabelText('Delete note');
    fireEvent.click(deleteButton);
    
    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Check if modal is closed
    expect(screen.queryByText('Delete Note')).not.toBeInTheDocument();
    
    // Check that onDelete was not called
    expect(mockProps.onDelete).not.toHaveBeenCalled();
  });
}); 