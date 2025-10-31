'use client';

import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
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

export function ScoreManager({ students, courseId, locale }: ScoreManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedScore, setSelectedScore] = useState<Score | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    score: '',
    maxScore: '100',
    remarks: '',
  });

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

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/teacher/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: selectedStudent,
          title: formData.title,
          score: parseFloat(formData.score),
          maxScore: parseFloat(formData.maxScore),
          remarks: formData.remarks || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to add score');

      setSuccess('Score added successfully!');
      setFormData({ title: '', score: '', maxScore: '100', remarks: '' });
      setSelectedStudent('');
      setTimeout(() => {
        setIsAddDialogOpen(false);
        window.location.reload();
      }, 1500);
    } catch (error) {
      setError('Failed to add score. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScore) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/teacher/scores/${selectedScore.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          score: parseFloat(formData.score),
          maxScore: parseFloat(formData.maxScore),
          remarks: formData.remarks || null,
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
    } finally {
      setIsLoading(false);
    }
  };

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
    setFormData({
      title: score.title,
      score: score.score.toString(),
      maxScore: score.maxScore.toString(),
      remarks: score.remarks || '',
    });
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

            <form onSubmit={handleAddScore} className="space-y-4">
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

              <div>
                <Label htmlFor="student">
                  <Trans>Student</Trans> *
                </Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent} required>
                  <SelectTrigger>
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

              <div>
                <Label htmlFor="title">
                  <Trans>Assessment Title</Trans> *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Midterm Exam, Assignment 1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="score">
                    <Trans>Score</Trans> *
                  </Label>
                  <Input
                    id="score"
                    type="number"
                    step="0.01"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="maxScore">
                    <Trans>Max Score</Trans> *
                  </Label>
                  <Input
                    id="maxScore"
                    type="number"
                    step="0.01"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="remarks">
                  <Trans>Remarks</Trans>
                </Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Optional feedback or comments"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isLoading}
                >
                  <Trans>Cancel</Trans>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trans>Add Score</Trans>
                  )}
                </Button>
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

          <form onSubmit={handleEditScore} className="space-y-4">
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

            <div>
              <Label htmlFor="edit-title">
                <Trans>Assessment Title</Trans> *
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-score">
                  <Trans>Score</Trans> *
                </Label>
                <Input
                  id="edit-score"
                  type="number"
                  step="0.01"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-maxScore">
                  <Trans>Max Score</Trans> *
                </Label>
                <Input
                  id="edit-maxScore"
                  type="number"
                  step="0.01"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-remarks">
                <Trans>Remarks</Trans>
              </Label>
              <Textarea
                id="edit-remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trans>Update Score</Trans>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
