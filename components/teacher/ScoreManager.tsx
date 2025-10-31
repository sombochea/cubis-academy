'use client';

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Trans } from '@lingui/react/macro';

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message;
  }
  return 'Invalid value';
};
import {
  Plus,
  Edit2,
  Trash2,
  Award,
  TrendingUp,
  Users,
  BarChart3,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils/date';

// Validation schema
const scoreSchema = z.object({
  title: z.string().min(1, 'Assessment title is required'),
  score: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Score must be a valid number',
  }),
  maxScore: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Max score must be greater than 0',
  }),
  remarks: z.string(),
});

interface Score {
  id: string;
  enrollmentId: string;
  title: string;
  score: number;
  maxScore: number;
  remarks: string | null;
  created: Date;
}

interface Student {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  progress: number;
  status: string;
  scores: Score[];
  avgScore: number | null;
}

interface ScoreManagerProps {
  students: Student[];
  courseId: string;
  locale: string;
}

export function ScoreManager({ students, locale }: ScoreManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedScore, setSelectedScore] = useState<Score | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Calculate stats
  const totalStudents = students.length;
  const studentsWithScores = students.filter((s) => s.scores.length > 0).length;
  const avgClassScore = students.length > 0
    ? Math.round(
        students
          .filter((s) => s.avgScore !== null)
          .reduce((sum, s) => sum + (s.avgScore || 0), 0) /
          students.filter((s) => s.avgScore !== null).length
      ) || 0
    : 0;
  const totalScores = students.reduce((sum, s) => sum + s.scores.length, 0);

  // Add Score Form
  const addForm = useForm({
    defaultValues: {
      title: '',
      score: '',
      maxScore: '100',
      remarks: '',
    },
    validators: {
      onChange: scoreSchema,
    },
    onSubmit: async ({ value }) => {
      setError('');
      setSuccess('');

      if (!selectedStudent) {
        setError('Please select a student');
        return;
      }

      try {
        const response = await fetch('/api/teacher/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId: selectedStudent,
            title: value.title,
            score: parseFloat(value.score),
            maxScore: parseFloat(value.maxScore),
            remarks: value.remarks || null,
          }),
        });

        if (!response.ok) throw new Error('Failed to add score');

        setSuccess('Score added successfully!');
        addForm.reset();
        setSelectedStudent('');
        setTimeout(() => {
          setIsAddDialogOpen(false);
          window.location.reload();
        }, 1500);
      } catch (error) {
        setError('Failed to add score. Please try again.');
      }
    },
  });

  // Edit Score Form
  const editForm = useForm({
    defaultValues: {
      title: '',
      score: '',
      maxScore: '100',
      remarks: '',
    },
    validators: {
      onChange: scoreSchema,
    },
    onSubmit: async ({ value }) => {
      if (!selectedScore) return;

      setError('');
      setSuccess('');

      try {
        const response = await fetch(`/api/teacher/scores/${selectedScore.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: value.title,
            score: parseFloat(value.score),
            maxScore: parseFloat(value.maxScore),
            remarks: value.remarks || null,
          }),
        });

        if (!response.ok) throw new Error('Failed to update score');

        setSuccess('Score updated successfully!');
        setTimeout(() => {
          setIsEditDialogOpen(false);
          window.location.reload();
        }, 1500);
      } catch (error) {
        setError('Failed to update score. Please try again.');
      }
    },
  });

  const handleDeleteScore = async (scoreId: string) => {
    if (!confirm('Are you sure you want to delete this score?')) return;

    try {
      const response = await fetch(`/api/teacher/scores/${scoreId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete score');

      window.location.reload();
    } catch (error) {
      alert('Failed to delete score. Please try again.');
    }
  };

  const openEditDialog = (score: Score) => {
    setSelectedScore(score);
    editForm.setFieldValue('title', score.title);
    editForm.setFieldValue('score', score.score.toString());
    editForm.setFieldValue('maxScore', score.maxScore.toString());
    editForm.setFieldValue('remarks', score.remarks || '');
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#17224D]">{totalStudents}</div>
              <div className="text-sm text-[#363942]/70">
                <Trans>Total Students</Trans>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#17224D]">{studentsWithScores}</div>
              <div className="text-sm text-[#363942]/70">
                <Trans>Graded Students</Trans>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#17224D]">{avgClassScore}%</div>
              <div className="text-sm text-[#363942]/70">
                <Trans>Class Average</Trans>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#17224D]">{totalScores}</div>
              <div className="text-sm text-[#363942]/70">
                <Trans>Total Scores</Trans>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Score Button */}
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              <Trans>Add Score</Trans>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                <Trans>Add New Score</Trans>
              </DialogTitle>
              <DialogDescription>
                <Trans>Add a score for a student's assessment or assignment</Trans>
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addForm.handleSubmit();
              }}
              className="space-y-4"
            >
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>{success}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="student" className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#007FFF]" />
                  <Trans>Student</Trans>
                  <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent} required>
                  <SelectTrigger className="w-full !h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.enrollmentId} value={student.enrollmentId}>
                        {student.studentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <addForm.Field name="title">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#007FFF]" />
                      <Trans>Assessment Title</Trans>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Midterm Exam, Assignment 1"
                      className="h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF]"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">
                        {getErrorMessage(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              </addForm.Field>

              <div className="grid grid-cols-2 gap-4">
                <addForm.Field name="score">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name} className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-[#007FFF]" />
                        <Trans>Score</Trans>
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="0"
                        className="h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF]"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-600">
                          {getErrorMessage(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </addForm.Field>

                <addForm.Field name="maxScore">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name} className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-[#007FFF]" />
                        <Trans>Max Score</Trans>
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="100"
                        className="h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF]"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-600">
                          {getErrorMessage(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </addForm.Field>
              </div>

              <addForm.Field name="remarks">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#007FFF]" />
                      <Trans>Remarks</Trans>
                      <span className="text-xs text-[#363942]/70 font-normal ml-1">
                        (<Trans>Optional</Trans>)
                      </span>
                    </Label>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Optional feedback or comments"
                      rows={3}
                      className="border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] resize-none"
                    />
                  </div>
                )}
              </addForm.Field>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="h-11"
                >
                  <Trans>Cancel</Trans>
                </Button>
                <addForm.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting || !selectedStudent}
                      className="gap-2 h-11 bg-gradient-to-r from-[#007FFF] to-[#17224D]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <Trans>Adding...</Trans>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <Trans>Add Score</Trans>
                        </>
                      )}
                    </Button>
                  )}
                </addForm.Subscribe>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#17224D]">
            <Trans>Student Scores</Trans>
          </h2>
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-[#363942]/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#17224D] mb-2">
              <Trans>No students enrolled</Trans>
            </h3>
            <p className="text-[#363942]/70">
              <Trans>Students will appear here when they enroll in this course</Trans>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((student) => (
              <div key={student.enrollmentId} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-full flex items-center justify-center text-white font-semibold">
                      {student.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#17224D]">
                        {student.studentName}
                      </h3>
                      <p className="text-sm text-[#363942]/70">{student.studentEmail}</p>
                    </div>
                  </div>

                  {student.avgScore !== null && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#007FFF]">
                        {student.avgScore}%
                      </div>
                      <div className="text-sm text-[#363942]/70">
                        <Trans>Average</Trans>
                      </div>
                    </div>
                  )}
                </div>

                {student.scores.length === 0 ? (
                  <div className="text-center py-6 bg-[#F4F5F7] rounded-lg">
                    <Award className="w-8 h-8 text-[#363942]/20 mx-auto mb-2" />
                    <p className="text-sm text-[#363942]/70">
                      <Trans>No scores yet</Trans>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {student.scores.map((score) => {
                      const percentage = Math.round((score.score / score.maxScore) * 100);
                      return (
                        <div
                          key={score.id}
                          className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-[#17224D]">{score.title}</h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  percentage >= 80
                                    ? 'bg-green-100 text-green-700'
                                    : percentage >= 60
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {percentage}%
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[#363942]/70">
                              <span>
                                {score.score} / {score.maxScore}
                              </span>
                              <span>{formatDate(score.created, locale)}</span>
                              {score.remarks && (
                                <span className="italic">"{score.remarks}"</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(score)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteScore(score.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              <Trans>Edit Score</Trans>
            </DialogTitle>
            <DialogDescription>
              <Trans>Update the score details</Trans>
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              editForm.handleSubmit();
            }}
            className="space-y-4"
          >
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <editForm.Field name="title">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#007FFF]" />
                    <Trans>Assessment Title</Trans>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF]"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">
                      {getErrorMessage(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </editForm.Field>

            <div className="grid grid-cols-2 gap-4">
              <editForm.Field name="score">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-[#007FFF]" />
                      <Trans>Score</Trans>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      type="number"
                      step="0.01"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF]"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">
                        {getErrorMessage(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              </editForm.Field>

              <editForm.Field name="maxScore">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-[#007FFF]" />
                      <Trans>Max Score</Trans>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      type="number"
                      step="0.01"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF]"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">
                        {getErrorMessage(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              </editForm.Field>
            </div>

            <editForm.Field name="remarks">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#007FFF]" />
                    <Trans>Remarks</Trans>
                    <span className="text-xs text-[#363942]/70 font-normal ml-1">
                      (<Trans>Optional</Trans>)
                    </span>
                  </Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={3}
                    className="border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] resize-none"
                  />
                </div>
              )}
            </editForm.Field>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="h-11"
              >
                <Trans>Cancel</Trans>
              </Button>
              <editForm.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="gap-2 h-11 bg-gradient-to-r from-[#007FFF] to-[#17224D]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <Trans>Updating...</Trans>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <Trans>Update Score</Trans>
                      </>
                    )}
                  </Button>
                )}
              </editForm.Subscribe>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
