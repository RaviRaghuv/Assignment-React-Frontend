import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  DocumentTextIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { DatabaseService } from '../services/database';
import { QUESTION_TYPES, createAssessment, createSection, createQuestion } from '../types';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal, { ModalBody} from '../components/ui/Modal';

export default function AssessmentBuilder() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingQuestionSection, setEditingQuestionSection] = useState(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [jobData, assessmentData] = await Promise.all([
        DatabaseService.getJobById(jobId),
        DatabaseService.getAssessmentByJobId(jobId),
      ]);
      
      setJob(jobData);
      
      if (assessmentData) {
        setAssessment(assessmentData);
      } else {
        
        const newAssessment = createAssessment({
          jobId,
          title: `${jobData?.title} Assessment`,
          description: `Assessment for the ${jobData?.title} position`,
          sections: [],
        });
        setAssessment(newAssessment);
      }
    } catch (error) {
      console.error('Error loading assessment data:', error);
      toast.error('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      loadData();
    }
  }, [jobId, loadData]);

  const handleSaveAssessment = async () => {
    try {
      if (assessment.id) {
        await DatabaseService.updateAssessment(assessment.id, assessment);
      } else {
        const savedAssessment = await DatabaseService.createAssessment(assessment);
        setAssessment(savedAssessment);
      }
      toast.success('Assessment saved successfully');
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment');
    }
  };

  const handleAddSection = (sectionData) => {
    const newSection = createSection({
      ...sectionData,
      order: assessment.sections.length,
    });
    
    setAssessment({
      ...assessment,
      sections: [...assessment.sections, newSection],
    });
    
    setShowSectionModal(false);
    toast.success('Section added successfully');
  };

  const handleUpdateSection = (sectionData) => {
    const updatedSections = assessment.sections.map(section =>
      section.id === editingSection.id
        ? { ...section, ...sectionData }
        : section
    );
    
    setAssessment({
      ...assessment,
      sections: updatedSections,
    });
    
    setEditingSection(null);
    setShowSectionModal(false);
    toast.success('Section updated successfully');
  };

  const handleDeleteSection = (sectionId) => {
    setAssessment({
      ...assessment,
      sections: assessment.sections.filter(section => section.id !== sectionId),
    });
    toast.success('Section deleted successfully');
  };

  const handleAddQuestion = (questionData, sectionId) => {
    const newQuestion = createQuestion({
      ...questionData,
      order: assessment.sections.find(s => s.id === sectionId).questions.length,
    });
    
    const updatedSections = assessment.sections.map(section =>
      section.id === sectionId
        ? { ...section, questions: [...section.questions, newQuestion] }
        : section
    );
    
    setAssessment({
      ...assessment,
      sections: updatedSections,
    });
    
    setShowQuestionModal(false);
    setEditingQuestionSection(null);
    toast.success('Question added successfully');
  };

  const handleUpdateQuestion = (questionData, sectionId) => {
    const updatedSections = assessment.sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            questions: section.questions.map(question =>
              question.id === editingQuestion.id
                ? { ...question, ...questionData }
                : question
            ),
          }
        : section
    );
    
    setAssessment({
      ...assessment,
      sections: updatedSections,
    });
    
    setEditingQuestion(null);
    setEditingQuestionSection(null);
    setShowQuestionModal(false);
    toast.success('Question updated successfully');
  };

  const handleDeleteQuestion = (sectionId, questionId) => {
    const updatedSections = assessment.sections.map(section =>
      section.id === sectionId
        ? { ...section, questions: section.questions.filter(q => q.id !== questionId) }
        : section
    );
    
    setAssessment({
      ...assessment,
      sections: updatedSections,
    });
    toast.success('Question deleted successfully');
  };

  const questionTypeOptions = [
    { value: QUESTION_TYPES.SINGLE_CHOICE, label: 'Single Choice' },
    { value: QUESTION_TYPES.MULTI_CHOICE, label: 'Multiple Choice' },
    { value: QUESTION_TYPES.SHORT_TEXT, label: 'Short Text' },
    { value: QUESTION_TYPES.LONG_TEXT, label: 'Long Text' },
    { value: QUESTION_TYPES.NUMERIC, label: 'Numeric' },
    { value: QUESTION_TYPES.FILE_UPLOAD, label: 'File Upload' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">Job not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The job you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/app/assessments">
            <Button variant="outline">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Assessments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/app/assessments">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assessment Builder</h1>
            <p className="mt-1 text-sm text-gray-500">
              Building assessment for: {job.title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            Preview
          </Button>
          
          <Button onClick={handleSaveAssessment}>
            Save Assessment
          </Button>
        </div>
      </div>

      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Assessment Details</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Assessment Title"
              value={assessment.title}
              onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={assessment.description}
                onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Describe the assessment..."
              />
            </div>
          </div>
        </CardBody>
      </Card>

    
      <div className="space-y-4">
        {assessment.sections.map((section, sectionIndex) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {section.title || `Section ${sectionIndex + 1}`}
                  </h3>
                  {section.description && (
                    <p className="mt-1 text-sm text-gray-500">{section.description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSection(section);
                      setShowSectionModal(true);
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingQuestionSection(section);
                      setShowQuestionModal(true);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                  
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardBody>
              {section.questions.length === 0 ? (
                <div className="text-center py-6">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add questions to this section to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {section.questions.map((question, questionIndex) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-500">
                              Q{questionIndex + 1}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              question.type === QUESTION_TYPES.SINGLE_CHOICE ? 'bg-blue-100 text-blue-800' :
                              question.type === QUESTION_TYPES.MULTI_CHOICE ? 'bg-green-100 text-green-800' :
                              question.type === QUESTION_TYPES.SHORT_TEXT ? 'bg-yellow-100 text-yellow-800' :
                              question.type === QUESTION_TYPES.LONG_TEXT ? 'bg-purple-100 text-purple-800' :
                              question.type === QUESTION_TYPES.NUMERIC ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {questionTypeOptions.find(opt => opt.value === question.type)?.label}
                            </span>
                            {question.required && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Required
                              </span>
                            )}
                          </div>
                          
                          <h4 className="mt-2 text-sm font-medium text-gray-900">
                            {question.title}
                          </h4>
                          
                          {question.description && (
                            <p className="mt-1 text-sm text-gray-500">{question.description}</p>
                          )}
                          
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {question.options.map((option, optionIndex) => (
                                  <li key={optionIndex}>{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingQuestion(question);
                              setEditingQuestionSection(section);
                              setShowQuestionModal(true);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteQuestion(section.id, question.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

   
      <Card>
        <CardBody>
          <Button
            variant="outline"
            onClick={() => setShowSectionModal(true)}
            className="w-full"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Section
          </Button>
        </CardBody>
      </Card>

      {/* Section Modal */}
      <Modal
        isOpen={showSectionModal}
        onClose={() => {
          setShowSectionModal(false);
          setEditingSection(null);
        }}
        title={editingSection ? "Edit Section" : "Add Section"}
        size="md"
      >
        <ModalBody>
          <SectionForm
            section={editingSection}
            onSubmit={editingSection ? handleUpdateSection : handleAddSection}
            onCancel={() => {
              setShowSectionModal(false);
              setEditingSection(null);
            }}
          />
        </ModalBody>
      </Modal>

      {/* Question Modal */}
      <Modal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setEditingQuestion(null);
          setEditingQuestionSection(null);
        }}
        title={editingQuestion ? "Edit Question" : "Add Question"}
        size="lg"
      >
      <ModalBody>
        <QuestionForm
          question={editingQuestion}
          questionTypes={questionTypeOptions}
          availableQuestions={editingQuestionSection?.questions || []}
          onSubmit={(questionData) => {
            if (editingQuestion) {
              handleUpdateQuestion(questionData, editingQuestionSection.id);
            } else {
              handleAddQuestion(questionData, editingQuestionSection.id);
            }
          }}
          onCancel={() => {
            setShowQuestionModal(false);
            setEditingQuestion(null);
            setEditingQuestionSection(null);
          }}
        />
      </ModalBody>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Assessment Preview"
        size="xl"
      >
        <ModalBody>
          <AssessmentPreview assessment={assessment} />
        </ModalBody>
      </Modal>
    </div>
  );
}

// Section Form Component
function SectionForm({ section, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: section?.title || '',
    description: section?.description || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Section title is required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Section Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="Describe what this section covers..."
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {section ? 'Update Section' : 'Add Section'}
        </Button>
      </div>
    </form>
  );
}

// Question Form Component
function QuestionForm({ question, questionTypes, availableQuestions = [], onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: question?.type || QUESTION_TYPES.SHORT_TEXT,
    title: question?.title || '',
    description: question?.description || '',
    required: question?.required || false,
    options: question?.options || [],
    validation: {
      minLength: question?.validation?.minLength ?? null,
      maxLength: question?.validation?.maxLength ?? null,
      minValue: question?.validation?.minValue ?? null,
      maxValue: question?.validation?.maxValue ?? null,
      pattern: question?.validation?.pattern ?? null,
    },
    conditionalLogic: question?.conditionalLogic || null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Question title is required');
      return;
    }
    onSubmit(formData);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ''],
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const removeOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const isChoiceType = formData.type === QUESTION_TYPES.SINGLE_CHOICE || formData.type === QUESTION_TYPES.MULTI_CHOICE;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Question Type"
        options={questionTypes}
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        required
      />
      
      <Input
        label="Question Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="Additional context or instructions..."
        />
      </div>
      
      {isChoiceType && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
        </div>
      )}

      {/* Validation settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(formData.type === QUESTION_TYPES.SHORT_TEXT || formData.type === QUESTION_TYPES.LONG_TEXT) && (
          <>
            <Input
              label="Min Length"
              type="number"
              value={formData.validation.minLength ?? ''}
              onChange={(e) => setFormData({
                ...formData,
                validation: { ...formData.validation, minLength: e.target.value ? Number(e.target.value) : null },
              })}
            />
            <Input
              label="Max Length"
              type="number"
              value={formData.validation.maxLength ?? ''}
              onChange={(e) => setFormData({
                ...formData,
                validation: { ...formData.validation, maxLength: e.target.value ? Number(e.target.value) : null },
              })}
            />
          </>
        )}
        {formData.type === QUESTION_TYPES.NUMERIC && (
          <>
            <Input
              label="Min Value"
              type="number"
              value={formData.validation.minValue ?? ''}
              onChange={(e) => setFormData({
                ...formData,
                validation: { ...formData.validation, minValue: e.target.value !== '' ? Number(e.target.value) : null },
              })}
            />
            <Input
              label="Max Value"
              type="number"
              value={formData.validation.maxValue ?? ''}
              onChange={(e) => setFormData({
                ...formData,
                validation: { ...formData.validation, maxValue: e.target.value !== '' ? Number(e.target.value) : null },
              })}
            />
          </>
        )}
      </div>

      {/* Conditional logic */}
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="conditional-enabled"
            checked={!!formData.conditionalLogic}
            onChange={(e) => setFormData({
              ...formData,
              conditionalLogic: e.target.checked ? { questionId: availableQuestions[0]?.id || null, operator: 'equals', value: '' } : null,
            })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="conditional-enabled" className="ml-2 block text-sm text-gray-900">
            Show this question only if another question meets a condition
          </label>
        </div>
        {formData.conditionalLogic && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Depends On</label>
              <select
                value={formData.conditionalLogic.questionId || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  conditionalLogic: { ...formData.conditionalLogic, questionId: e.target.value },
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                {availableQuestions.filter(q => q.id !== question?.id).map(q => (
                  <option key={q.id} value={q.id}>{q.title || q.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operator</label>
              <select
                value={formData.conditionalLogic.operator}
                onChange={(e) => setFormData({
                  ...formData,
                  conditionalLogic: { ...formData.conditionalLogic, operator: e.target.value },
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="equals">Equals</option>
              </select>
            </div>
            <div>
              <Input
                label="Value"
                value={formData.conditionalLogic.value}
                onChange={(e) => setFormData({
                  ...formData,
                  conditionalLogic: { ...formData.conditionalLogic, value: e.target.value },
                })}
                placeholder="e.g., Yes"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="required"
          checked={formData.required}
          onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
          This question is required
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {question ? 'Update Question' : 'Add Question'}
        </Button>
      </div>
    </form>
  );
}

// Assessment Preview Component
function AssessmentPreview({ assessment }) {
  const [responses, setResponses] = useState(() => {
    try {
      const saved = localStorage.getItem(`assessmentPreviewResponses:${assessment.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [errors, setErrors] = useState({});

  const setResponse = (questionId, value) => {
    const next = { ...responses, [questionId]: value };
    setResponses(next);
    try {
      localStorage.setItem(`assessmentPreviewResponses:${assessment.id}`, JSON.stringify(next));
    } catch (e) {}
  };

  const isQuestionVisible = (question) => {
    if (!question.conditionalLogic) return true;
    const { questionId, operator, value } = question.conditionalLogic;
    if (!questionId) return true;
    const targetValue = responses[questionId];
    if (operator === 'equals') {
      // For multi choice, targetValue can be array
      if (Array.isArray(targetValue)) return targetValue.includes(value);
      return String(targetValue ?? '') === String(value ?? '');
    }
    return true;
  };

  const validate = () => {
    const nextErrors = {};
    assessment.sections.forEach(section => {
      section.questions.forEach(q => {
        if (!isQuestionVisible(q)) return;
        const val = responses[q.id];
        if (q.required && (val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0))) {
          nextErrors[q.id] = 'This field is required';
          return;
        }
        if (q.validation) {
          const v = q.validation;
          if ((q.type === QUESTION_TYPES.SHORT_TEXT || q.type === QUESTION_TYPES.LONG_TEXT) && typeof val === 'string') {
            if (v.minLength != null && val.length < v.minLength) nextErrors[q.id] = `Minimum length is ${v.minLength}`;
            if (v.maxLength != null && val.length > v.maxLength) nextErrors[q.id] = `Maximum length is ${v.maxLength}`;
            if (v.pattern) {
              try {
                const re = new RegExp(v.pattern);
                if (!re.test(val)) nextErrors[q.id] = 'Invalid format';
              } catch (e) {}
            }
          }
          if (q.type === QUESTION_TYPES.NUMERIC && val !== '' && val != null) {
            const num = Number(val);
            if (!Number.isFinite(num)) nextErrors[q.id] = 'Enter a valid number';
            if (v.minValue != null && num < v.minValue) nextErrors[q.id] = `Minimum is ${v.minValue}`;
            if (v.maxValue != null && num > v.maxValue) nextErrors[q.id] = `Maximum is ${v.maxValue}`;
          }
        }
      });
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    toast.success('Responses validated and saved locally');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{assessment.title}</h2>
        {assessment.description && (
          <p className="mt-2 text-gray-600">{assessment.description}</p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {assessment.sections.map((section, sectionIndex) => (
          <div key={section.id} className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {section.title || `Section ${sectionIndex + 1}`}
            </h3>
            {section.description && (
              <p className="text-sm text-gray-500 mb-4">{section.description}</p>
            )}
            
            <div className="space-y-4">
              {section.questions.map((question, questionIndex) => (
                isQuestionVisible(question) && (
                  <div key={question.id} className="border-l-4 border-primary-200 pl-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Q{questionIndex + 1}
                      </span>
                      {question.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {question.title}
                    </h4>
                    
                    {question.description && (
                      <p className="text-sm text-gray-500 mb-2">{question.description}</p>
                    )}

                    {question.type === QUESTION_TYPES.SHORT_TEXT && (
                      <input
                        type="text"
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${errors[question.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                        placeholder="Enter your answer..."
                        value={responses[question.id] ?? ''}
                        onChange={(e) => setResponse(question.id, e.target.value)}
                      />
                    )}

                    {question.type === QUESTION_TYPES.LONG_TEXT && (
                      <textarea
                        rows={3}
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${errors[question.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                        placeholder="Enter your answer..."
                        value={responses[question.id] ?? ''}
                        onChange={(e) => setResponse(question.id, e.target.value)}
                      />
                    )}

                    {question.type === QUESTION_TYPES.NUMERIC && (
                      <input
                        type="number"
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${errors[question.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                        placeholder="Enter a number..."
                        value={responses[question.id] ?? ''}
                        onChange={(e) => setResponse(question.id, e.target.value)}
                      />
                    )}

                    {(question.type === QUESTION_TYPES.SINGLE_CHOICE || question.type === QUESTION_TYPES.MULTI_CHOICE) && (
                      <div className="space-y-2">
                        {question.options?.map((option, optionIndex) => {
                          const name = `question-${question.id}`;
                          if (question.type === QUESTION_TYPES.SINGLE_CHOICE) {
                            return (
                              <label key={optionIndex} className="flex items-center">
                                <input
                                  type="radio"
                                  name={name}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                  checked={responses[question.id] === option}
                                  onChange={() => setResponse(question.id, option)}
                                />
                                <span className="ml-2 text-sm text-gray-700">{option}</span>
                              </label>
                            );
                          }
                          const arr = Array.isArray(responses[question.id]) ? responses[question.id] : [];
                          const checked = arr.includes(option);
                          const toggle = () => {
                            const next = checked ? arr.filter(v => v !== option) : [...arr, option];
                            setResponse(question.id, next);
                          };
                          return (
                            <label key={optionIndex} className="flex items-center">
                              <input
                                type="checkbox"
                                name={name}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                checked={checked}
                                onChange={toggle}
                              />
                              <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {question.type === QUESTION_TYPES.FILE_UPLOAD && (
                      <input
                        type="file"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        onChange={(e) => setResponse(question.id, e.target.files?.[0]?.name || '')}
                      />
                    )}

                    {errors[question.id] && (
                      <p className="mt-1 text-sm text-red-600">{errors[question.id]}</p>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end">
          <Button type="submit">
            Validate & Save
          </Button>
        </div>
      </form>
    </div>
  );
}