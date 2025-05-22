import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BookOpen, Plus, Trash2, Save, Loader } from 'lucide-react';

const CreateAssignmentForm = ({ teacherId, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'exam', // 'exam' or 'quiz'
    module: '',
    title: '',
    description: '',
    dateDebut: '',
    heureDebut: '',
    dateFin: '',
    heureFin: '',
    duration: 120, // durée en minutes
    selectedStudents: [],
    questions: []
  });

  const [availableStudents, setAvailableStudents] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState({});

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true);
      await Promise.all([
        fetchStudents(),
        fetchModules()
      ]);
      setIsLoadingData(false);
    };

    if (teacherId) {
      loadInitialData();
    }
  }, [teacherId]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`http://localhost:8000/teacher/${teacherId}/students`);
      if (response.ok) {
        const data = await response.json();
        setAvailableStudents(data.students || []);
      } else {
        console.error('Erreur lors du chargement des étudiants');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch('http://localhost:8000/modules');
      if (response.ok) {
        const data = await response.json();
        setAvailableModules(data.modules || []);
      } else {
        console.error('Erreur lors du chargement des modules');
        // Modules par défaut en cas d'erreur
        setAvailableModules([
          "Mathématiques",
          "Physique", 
          "Informatique",
          "Chimie",
          "Biologie",
          "Histoire",
          "Géographie",
          "Français",
          "Anglais"
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error);
      // Modules par défaut en cas d'erreur
      setAvailableModules([
        "Mathématiques",
        "Physique", 
        "Informatique",
        "Chimie",
        "Biologie",
        "Histoire",
        "Géographie",
        "Français",
        "Anglais"
      ]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStudentSelection = (studentId) => {
    setFormData(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
    }));
  };

  const selectAllStudents = () => {
    const allStudentIds = availableStudents.map(student => student.id);
    setFormData(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.length === allStudentIds.length 
        ? [] 
        : allStudentIds
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1
    };
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.map((opt, idx) => idx === optionIndex ? value : opt)
            } 
          : q
      )
    }));
  };

  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.module) newErrors.module = 'Module requis';
    if (!formData.title) newErrors.title = 'Titre requis';
    if (!formData.dateDebut) newErrors.dateDebut = 'Date de début requise';
    if (!formData.heureDebut) newErrors.heureDebut = 'Heure de début requise';
    if (!formData.dateFin) newErrors.dateFin = 'Date de fin requise';
    if (!formData.heureFin) newErrors.heureFin = 'Heure de fin requise';
    if (formData.selectedStudents.length === 0) {
      newErrors.selectedStudents = 'Au moins un étudiant requis';
    }
    if (formData.questions.length === 0) {
      newErrors.questions = 'Au moins une question requise';
    }

    // Validation des dates
    const startDateTime = new Date(`${formData.dateDebut}T${formData.heureDebut}`);
    const endDateTime = new Date(`${formData.dateFin}T${formData.heureFin}`);
    
    if (startDateTime >= endDateTime) {
      newErrors.dateFin = 'La date/heure de fin doit être après le début';
    }

    // Validation des questions
    formData.questions.forEach((q, index) => {
      if (!q.question.trim()) {
        newErrors[`question_${index}`] = 'Question requise';
      }
      if (q.type === 'multiple_choice' && q.options.some(opt => !opt.trim())) {
        newErrors[`question_options_${index}`] = 'Toutes les options sont requises';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const startDateTime = new Date(`${formData.dateDebut}T${formData.heureDebut}`);
      const endDateTime = new Date(`${formData.dateFin}T${formData.heureFin}`);

      const payload = {
        id_teacher: teacherId,
        module_name: formData.module,
        title: formData.title,
        description: formData.description,
        students: formData.selectedStudents,
        questions: formData.questions,
        ...(formData.type === 'exam' ? {
          date_debut_exame: startDateTime.toISOString(),
          date_fin_exame: endDateTime.toISOString()
        } : {
          date_debut_quiz: startDateTime.toISOString(),
          date_fin_quiz: endDateTime.toISOString()
        })
      };

      const endpoint = formData.type === 'exam' ? '/exams' : '/quizzes';
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`${formData.type === 'exam' ? 'Examen' : 'Quiz'} créé avec succès !`);
        onSuccess && onSuccess();
        
        // Reset form
        setFormData({
          type: 'exam',
          module: '',
          title: '',
          description: '',
          dateDebut: '',
          heureDebut: '',
          dateFin: '',
          heureFin: '',
          duration: 120,
          selectedStudents: [],
          questions: []
        });
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.detail || 'Échec de la création'}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'exam',
      module: '',
      title: '',
      description: '',
      dateDebut: '',
      heureDebut: '',
      dateFin: '',
      heureFin: '',
      duration: 120,
      selectedStudents: [],
      questions: []
    });
    setErrors({});
  };

  if (isLoadingData) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin mr-2" />
          <span>Chargement des données...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Créer un {formData.type === 'exam' ? 'Examen' : 'Quiz'}
        </h2>
        <p className="text-gray-600">
          Remplissez les informations pour créer votre évaluation
        </p>
      </div>

      <div className="space-y-6">
        {/* Type Selection */}
        <div className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="exam"
              checked={formData.type === 'exam'}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span className="font-medium">Examen</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="quiz"
              checked={formData.type === 'quiz'}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span className="font-medium">Quiz</span>
          </label>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="inline w-4 h-4 mr-1" />
              Module
            </label>
            <select
              name="module"
              value={formData.module}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.module ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionner un module</option>
              {availableModules.map((module, index) => (
                <option key={index} value={module}>{module}</option>
              ))}
            </select>
            {errors.module && <p className="text-red-500 text-sm mt-1">{errors.module}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Titre de l'évaluation"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            placeholder="Description de l'évaluation"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date début
            </label>
            <input
              type="date"
              name="dateDebut"
              value={formData.dateDebut}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dateDebut ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dateDebut && <p className="text-red-500 text-sm mt-1">{errors.dateDebut}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Heure début
            </label>
            <input
              type="time"
              name="heureDebut"
              value={formData.heureDebut}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.heureDebut ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.heureDebut && <p className="text-red-500 text-sm mt-1">{errors.heureDebut}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date fin
            </label>
            <input
              type="date"
              name="dateFin"
              value={formData.dateFin}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dateFin ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dateFin && <p className="text-red-500 text-sm mt-1">{errors.dateFin}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure fin
            </label>
            <input
              type="time"
              name="heureFin"
              value={formData.heureFin}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.heureFin ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.heureFin && <p className="text-red-500 text-sm mt-1">{errors.heureFin}</p>}
          </div>
        </div>

        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline w-4 h-4 mr-1" />
            Étudiants ({formData.selectedStudents.length} sélectionnés)
          </label>
          <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
            {availableStudents.length > 0 ? (
              <>
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={selectAllStudents}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {formData.selectedStudents.length === availableStudents.length 
                      ? 'Désélectionner tout' 
                      : 'Sélectionner tout'
                    }
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableStudents.map(student => (
                    <label key={student.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.selectedStudents.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{student.name} ({student.id})</span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Aucun étudiant disponible</p>
            )}
          </div>
          {errors.selectedStudents && (
            <p className="text-red-500 text-sm mt-1">{errors.selectedStudents}</p>
          )}
        </div>

        {/* Questions Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Questions ({formData.questions.length})
            </label>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter Question
            </button>
          </div>

          {formData.questions.map((question, index) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium">Question {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Énoncé de la question"
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`question_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`question_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`question_${index}`]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct_${question.id}`}
                        checked={question.correctAnswer === optIndex}
                        onChange={() => updateQuestion(question.id, 'correctAnswer', optIndex)}
                        className="text-green-600"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${optIndex + 1}`}
                        value={option}
                        onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>

                {errors[`question_options_${index}`] && (
                  <p className="text-red-500 text-sm">{errors[`question_options_${index}`]}</p>
                )}

                <div className="flex items-center space-x-4">
                  <div>
                    <label className="text-sm text-gray-600">Points:</label>
                    <input
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value))}
                      className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {errors.questions && (
            <p className="text-red-500 text-sm mt-1">{errors.questions}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Création...' : `Créer ${formData.type === 'exam' ? 'Examen' : 'Quiz'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignmentForm;