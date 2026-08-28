import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

interface QuestionCategory { id: number; name: string; description: string; active: boolean; }
interface Subject { id: number; name: string; }
interface Question {
  id: number; subjectId: number; subjectName: string; categoryId: number; categoryName: string;
  questionType: string; difficulty: string; questionText: string; correctAnswer: string;
  optionA: string; optionB: string; optionC: string; optionD: string;
  explanation: string; points: number; tags: string; createdBy: string; active: boolean;
}

@Component({
  templateUrl: './question-bank.component.html',
  styleUrl: './question-bank.component.css',
    selector: 'app-question-bank',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class QuestionBankComponent implements OnInit {
  tab = 'list';
  subjects: Subject[] = [];
  categories: QuestionCategory[] = [];
  questions: Question[] = [];
  stats: any = null;
  searchTerm = '';

  filterSubjectId: number | null = null;
  formSubjectId: number | null = null;
  formCategoryId: number | null = null;
  formType = 'OPEN';
  formDifficulty = 'MEDIUM';
  formQuestionText = '';
  formCorrectAnswer = '';
  formOptionA = '';
  formOptionB = '';
  formOptionC = '';
  formOptionD = '';
  formExplanation = '';
  formPoints = 1;
  formTags = '';

  showCatForm = false;
  catFormName = '';
  catFormDescription = '';

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.http.get<Subject[]>(`${API_URL}/academic/subjects`).subscribe({ next: d => this.subjects = d });
    this.loadStats();
  }

  private showMsg(msg: string, err = false) {
    this.message = msg;
    this.messageIsError = err;
    setTimeout(() => this.message = '', 4000);
  }

  loadStats() {
    const instId = this.auth.institutionId() || 1;
    this.http.get(`${API_URL}/question-bank/stats/${instId}`).subscribe({
      next: d => this.stats = d, error: () => {}
    });
  }

  loadCategories() {
    const instId = this.auth.institutionId() || 1;
    this.http.get<QuestionCategory[]>(`${API_URL}/question-bank/categories`, { params: { institutionId: instId } })
      .subscribe({ next: d => this.categories = d });
  }

  loadQuestions() {
    const instId = this.auth.institutionId() || 1;
    if (this.filterSubjectId) {
      this.http.get<Question[]>(`${API_URL}/question-bank/questions/subject/${this.filterSubjectId}`)
        .subscribe({ next: d => this.questions = d, error: () => this.showMsg('Error al cargar', true) });
    } else {
      this.http.get<Question[]>(`${API_URL}/question-bank/questions/search`, { params: { institutionId: instId, q: '' } })
        .subscribe({ next: d => this.questions = d, error: () => this.showMsg('Error al cargar', true) });
    }
  }

  searchQuestions() {
    const instId = this.auth.institutionId() || 1;
    this.http.get<Question[]>(`${API_URL}/question-bank/questions/search`, { params: { institutionId: instId, q: this.searchTerm } })
      .subscribe({ next: d => this.questions = d, error: () => this.showMsg('Error al buscar', true) });
  }

  createQuestion() {
    if (!this.formSubjectId || !this.formQuestionText) return;
    const instId = this.auth.institutionId() || 1;
    this.http.post(`${API_URL}/question-bank/questions`, {
      subjectId: this.formSubjectId,
      categoryId: this.formCategoryId,
      institutionId: instId,
      questionType: this.formType,
      difficulty: this.formDifficulty,
      questionText: this.formQuestionText,
      correctAnswer: this.formCorrectAnswer,
      optionA: this.formOptionA, optionB: this.formOptionB,
      optionC: this.formOptionC, optionD: this.formOptionD,
      explanation: this.formExplanation,
      points: this.formPoints,
      tags: this.formTags
    }).subscribe({
      next: () => { this.showMsg('Pregunta creada'); this.tab = 'list'; this.loadQuestions(); this.loadStats(); },
      error: () => this.showMsg('Error al crear', true)
    });
  }

  deactivateQuestion(id: number) {
    if (!confirm('Eliminar esta pregunta?')) return;
    this.http.delete(`${API_URL}/question-bank/questions/${id}`).subscribe({
      next: () => { this.loadQuestions(); this.loadStats(); this.showMsg('Pregunta eliminada'); },
      error: () => this.showMsg('Error al eliminar', true)
    });
  }

  createCategory() {
    const instId = this.auth.institutionId() || 1;
    this.http.post(`${API_URL}/question-bank/categories`, { name: this.catFormName, description: this.catFormDescription }, { params: { institutionId: instId } })
      .subscribe({
        next: () => { this.showCatForm = false; this.loadCategories(); this.showMsg('Categoria creada'); },
        error: () => this.showMsg('Error al crear', true)
      });
  }

  deleteCategory(id: number) {
    if (!confirm('Eliminar esta categoria?')) return;
    this.http.delete(`${API_URL}/question-bank/categories/${id}`).subscribe({
      next: () => { this.loadCategories(); this.showMsg('Categoria eliminada'); },
      error: () => this.showMsg('Error al eliminar', true)
    });
  }

  resetForm() {
    this.formSubjectId = null; this.formCategoryId = null; this.formType = 'OPEN';
    this.formDifficulty = 'MEDIUM'; this.formQuestionText = ''; this.formCorrectAnswer = '';
    this.formOptionA = ''; this.formOptionB = ''; this.formOptionC = ''; this.formOptionD = '';
    this.formExplanation = ''; this.formPoints = 1; this.formTags = '';
  }

  resetCatForm() { this.catFormName = ''; this.catFormDescription = ''; }

  typeLabel(t: string): string {
    const m: Record<string, string> = { OPEN: 'Abierta', MULTIPLE_CHOICE: 'Multiple', TRUE_FALSE: 'V/F', FILL_BLANK: 'Completar', ESSAY: 'Ensayo' };
    return m[t] || t;
  }

  diffLabel(d: string): string {
    const m: Record<string, string> = { EASY: 'Facil', MEDIUM: 'Media', HARD: 'Dificil' };
    return m[d] || d;
  }
}
