import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { JOB_STATUS } from '../../types';
import { DatabaseService } from '../../services/database';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function JobForm({ initialData, onSubmit, onCancel }) {
  const [slugError, setSlugError] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: initialData || {
      title: '',
      slug: '',
      description: '',
      requirements: [],
      benefits: [],
      tags: [],
      location: '',
      salary: '',
      type: 'full-time',
      department: '',
      status: JOB_STATUS.ACTIVE,
    },
  });

  const watchedTags = watch('tags') || [];
  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');
  
  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !initialData?.slug) {
      const generatedSlug = DatabaseService.generateSlug(watchedTitle);
      setValue('slug', generatedSlug);
    }
  }, [watchedTitle, setValue, initialData?.slug]);
  
  // ✅ Wrap validateSlug in useCallback
  const validateSlug = useCallback(
    async (slug) => {
      if (!slug) return true;
      
      setIsCheckingSlug(true);
      try {
        const isUnique = await DatabaseService.isSlugUnique(slug, initialData?.id);
        if (!isUnique) {
          setSlugError('This slug is already taken');
          setError('slug', { message: 'This slug is already taken' });
          return false;
        } else {
          setSlugError('');
          clearErrors('slug');
          return true;
        }
      } catch (error) {
        console.error('Error validating slug:', error);
        return true; // Allow submission if validation fails
      } finally {
        setIsCheckingSlug(false);
      }
    },
    [initialData?.id, setError, clearErrors] // ✅ dependencies
  );
  
  // Debounced slug validation
  useEffect(() => {
    if (watchedSlug) {
      const timer = setTimeout(() => {
        validateSlug(watchedSlug);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [watchedSlug, validateSlug]); // ✅ include validateSlug here


  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
  ];

  const departments = [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Product', label: 'Product' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Customer Success', label: 'Customer Success' },
    { value: 'Data', label: 'Data' },
    { value: 'Operations', label: 'Operations' },
  ];

  const handleFormSubmit = async (data) => {
    try {
      // Final slug validation before submission
      if (data.slug) {
        const isSlugValid = await validateSlug(data.slug);
        if (!isSlugValid) {
          return;
        }
      }
      
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const addTag = (tag) => {
    if (tag && !watchedTags.includes(tag)) {
      setValue('tags', [...watchedTags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const addRequirement = () => {
    setValue('requirements', [...(watchedRequirements || []), '']);
  };

  const removeRequirement = (index) => {
    const requirements = watchedRequirements || [];
    setValue('requirements', requirements.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    setValue('benefits', [...(watchedBenefits || []), '']);
  };

  const removeBenefit = (index) => {
    const benefits = watchedBenefits || [];
    setValue('benefits', benefits.filter((_, i) => i !== index));
  };

  const watchedRequirements = watch('requirements') || [];
  const watchedBenefits = watch('benefits') || [];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="Job Title"
          {...register('title', { required: 'Title is required' })}
          error={errors.title?.message}
          required
        />
        
        <Input
          label="URL Slug"
          {...register('slug', { 
            required: 'Slug is required',
            pattern: {
              value: /^[a-z0-9-]+$/,
              message: 'Slug can only contain lowercase letters, numbers, and hyphens'
            }
          })}
          error={errors.slug?.message || slugError}
          helperText="Used in the job URL. Auto-generated from title."
          disabled={isCheckingSlug}
        />
        
        <Select
          label="Department"
          options={departments}
          {...register('department', { required: 'Department is required' })}
          error={errors.department?.message}
          required
        />
        
        <Input
          label="Location"
          {...register('location', { required: 'Location is required' })}
          error={errors.location?.message}
          required
        />
        
        <Input
          label="Salary Range"
          placeholder="e.g., $80,000 - $100,000"
          {...register('salary')}
          error={errors.salary?.message}
        />
        
        <Select
          label="Job Type"
          options={jobTypes}
          {...register('type', { required: 'Job type is required' })}
          error={errors.type?.message}
          required
        />
        
        <Select
          label="Status"
          options={[
            { value: JOB_STATUS.ACTIVE, label: 'Active' },
            { value: JOB_STATUS.ARCHIVED, label: 'Archived' },
          ]}
          {...register('status')}
          error={errors.status?.message}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="Describe the role, responsibilities, and what makes it exciting..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requirements
        </label>
        <div className="space-y-2">
          {watchedRequirements.map((requirement, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                {...register(`requirements.${index}`)}
                className="flex-1 block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter a requirement..."
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeRequirement(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRequirement}
          >
            Add Requirement
          </Button>
        </div>
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Benefits
        </label>
        <div className="space-y-2">
          {watchedBenefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                {...register(`benefits.${index}`)}
                className="flex-1 block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter a benefit..."
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeBenefit(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBenefit}
          >
            Add Benefit
          </Button>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Enter a tag..."
              className="flex-1 block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.querySelector('input[placeholder="Enter a tag..."]');
                if (input) {
                  addTag(input.value.trim());
                  input.value = '';
                }
              }}
            >
              Add Tag
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {watchedTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-primary-400 hover:bg-primary-200 hover:text-primary-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {initialData ? 'Update Job' : 'Create Job'}
        </Button>
      </div>
    </form>
  );
}
