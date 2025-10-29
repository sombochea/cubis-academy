'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trans } from '@lingui/react/macro';
import { 
  BookOpen, 
  FileText, 
  DollarSign, 
  Upload, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Image as ImageIcon,
  FileUp,
  Loader2
} from 'lucide-react';

// Helper to extract error message from Zod error
const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.toString) return error.toString();
  return 'Invalid value';
};

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  desc: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  teacherId: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  duration: z.string().regex(/^\d+$/, 'Duration must be a number'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  youtubeUrl: z.string().optional(),
  zoomUrl: z.string().optional(),
  coverImage: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CreateCourseWizardProps {
  locale: string;
  teachers: Array<{ userId: string; name: string }>;
  initialData?: Partial<CourseFormData>;
  courseId?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

const steps = [
  { id: 1, name: 'Basic Info', icon: BookOpen },
  { id: 2, name: 'Details', icon: FileText },
  { id: 3, name: 'Pricing', icon: DollarSign },
  { id: 4, name: 'Media', icon: Upload },
];

export function CreateCourseWizard({ locale, teachers, initialData, courseId }: CreateCourseWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(initialData?.coverImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const form = useForm({
    defaultValues: {
      title: initialData?.title || '',
      desc: initialData?.desc || '',
      categoryId: initialData?.categoryId || '',
      teacherId: initialData?.teacherId || '',
      price: initialData?.price || '0',
      duration: initialData?.duration || '0',
      level: (initialData?.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
      youtubeUrl: initialData?.youtubeUrl || '',
      zoomUrl: initialData?.zoomUrl || '',
      coverImage: initialData?.coverImage || '',
    },
    validators: {
      onChange: courseSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const endpoint = courseId 
          ? `/api/admin/courses/${courseId}` 
          : '/api/admin/courses';
        
        const method = courseId ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to ${courseId ? 'update' : 'create'} course`);
        }

        // Success animation then redirect
        setTimeout(() => {
          router.push(`/${locale}/admin/courses`);
          router.refresh();
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    },
  });

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'course_cover');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      form.setFieldValue('coverImage', data.fileUrl);
      setCoverImagePreview(data.fileUrl);
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const values = form.state.values;
    switch (currentStep) {
      case 1:
        return values.title.length >= 3 && values.categoryId.length >= 1;
      case 2:
        return values.desc.length >= 10;
      case 3:
        return /^\d+(\.\d{1,2})?$/.test(values.price) && /^\d+$/.test(values.duration);
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
      {/* Left Panel - Steps */}
      <div className="lg:col-span-4 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-8">
          {courseId ? <Trans>Edit Course</Trans> : <Trans>Create New Course</Trans>}
        </h2>
        
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.id * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white/20 shadow-lg' 
                    : isCompleted 
                    ? 'bg-white/10' 
                    : 'opacity-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isActive 
                    ? 'bg-white text-[#007FFF]' 
                    : 'bg-white/20'
                }`}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm opacity-80">Step {step.id}</p>
                  <p className="font-semibold">{step.name}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 p-4 bg-white/10 rounded-xl">
          <p className="text-sm opacity-90">
            <Trans>Fill in all required fields to create your course. You can always edit it later.</Trans>
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="lg:col-span-8 bg-white rounded-2xl p-8 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-[#17224D] mb-2">
                    <Trans>Basic Information</Trans>
                  </h3>
                  <p className="text-[#363942]/70">
                    <Trans>Let's start with the course name and category</Trans>
                  </p>
                </div>

                <form.Field name="title">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>
                        <Trans>Course Title</Trans> <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g., Complete Web Development Bootcamp"
                        className={`h-12 ${field.state.meta.errors.length > 0 ? 'border-red-500' : ''}`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="categoryId">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>
                        <Trans>Category</Trans> <span className="text-red-500">*</span>
                      </Label>
                      {loadingCategories ? (
                        <div className="h-12 flex items-center justify-center border rounded-lg">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <Select
                          value={field.state.value || 'none'}
                          onValueChange={(value) => field.handleChange(value === 'none' ? '' : value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <Trans>Select a category</Trans>
                            </SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  {category.icon && <span>{category.icon}</span>}
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
                      )}
                      {categories.length === 0 && !loadingCategories && (
                        <p className="text-sm text-yellow-600">
                          <Trans>No categories available. Please create one first.</Trans>
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="teacherId">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>
                        <Trans>Assign Teacher</Trans>
                      </Label>
                      <Select
                        value={field.state.value || 'none'}
                        onValueChange={(value) => field.handleChange(value === 'none' ? '' : value)}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a teacher (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <Trans>No teacher assigned</Trans>
                          </SelectItem>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.userId} value={teacher.userId}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-[#17224D] mb-2">
                    <Trans>Course Details</Trans>
                  </h3>
                  <p className="text-[#363942]/70">
                    <Trans>Describe what students will learn</Trans>
                  </p>
                </div>

                <form.Field name="desc">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>
                        <Trans>Description</Trans> <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        rows={8}
                        placeholder="Describe the course content, learning outcomes, and what makes it unique..."
                        className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                      />
                      <p className="text-xs text-gray-500">
                        {field.state.value.length} characters
                      </p>
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="level">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>
                        <Trans>Course Level</Trans> <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value as any)}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              <Trans>Beginner</Trans>
                            </div>
                          </SelectItem>
                          <SelectItem value="intermediate">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                              <Trans>Intermediate</Trans>
                            </div>
                          </SelectItem>
                          <SelectItem value="advanced">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              <Trans>Advanced</Trans>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              </motion.div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-[#17224D] mb-2">
                    <Trans>Pricing & Duration</Trans>
                  </h3>
                  <p className="text-[#363942]/70">
                    <Trans>Set the course price and estimated duration</Trans>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <form.Field name="price">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>
                          <Trans>Price ($)</Trans> <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            id={field.name}
                            type="text"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="0.00"
                            className={`h-12 pl-8 ${field.state.meta.errors.length > 0 ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="duration">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>
                          <Trans>Duration (hours)</Trans> <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={field.name}
                          type="text"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="0"
                          className={`h-12 ${field.state.meta.errors.length > 0 ? 'border-red-500' : ''}`}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong><Trans>Tip:</Trans></strong> <Trans>Consider market rates and course value when setting the price.</Trans>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Media */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-[#17224D] mb-2">
                    <Trans>Media & Resources</Trans>
                  </h3>
                  <p className="text-[#363942]/70">
                    <Trans>Add course cover image and learning resources</Trans>
                  </p>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <Label>
                    <Trans>Course Cover Image</Trans>
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#007FFF] transition-colors">
                    {coverImagePreview ? (
                      <div className="relative">
                        <img
                          src={coverImagePreview}
                          alt="Cover preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCoverImagePreview(null);
                            form.setFieldValue('coverImage', '');
                          }}
                          className="mt-4"
                        >
                          <Trans>Change Image</Trans>
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          disabled={isUploading}
                        />
                        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                          {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <Trans>Uploading...</Trans>
                            </span>
                          ) : (
                            <Trans>Click to upload or drag and drop</Trans>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 5MB
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                <form.Field name="youtubeUrl">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>
                        <Trans>YouTube URL</Trans>
                      </Label>
                      <Input
                        id={field.name}
                        type="url"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="h-12"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="zoomUrl">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>
                        <Trans>Zoom Meeting URL</Trans>
                      </Label>
                      <Input
                        id={field.name}
                        type="url"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="https://zoom.us/j/..."
                        className="h-12"
                      />
                    </div>
                  )}
                </form.Field>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <Trans>Previous</Trans>
            </Button>

            {currentStep < steps.length ? (
              <form.Subscribe selector={(state) => [state.values]}>
                {([values]) => (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="gap-2 bg-gradient-to-r from-[#007FFF] to-[#17224D]"
                  >
                    <Trans>Next</Trans>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </form.Subscribe>
            ) : (
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="button"
                    onClick={() => form.handleSubmit()}
                    disabled={!canSubmit || isSubmitting}
                    className="gap-2 bg-gradient-to-r from-green-500 to-green-600"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <Trans>Saving...</Trans>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <Trans>Save Course</Trans>
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
