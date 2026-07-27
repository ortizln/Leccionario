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
  selector: 'app-question-bank',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Banco de Preguntas</h4>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-3">
      <li><a class="nav-link" [class.active]="tab==='list'" (click)="tab='list'; loadQuestions()">Preguntas</a></li>
      <li><a class="nav-link" [class.active]="tab==='new'" (click)="tab='new'; resetForm()">Nueva Pregunta</a></li>
      <li><a class="nav-link" [class.active]="tab==='catalog'" (click)="tab='catalog'; loadCategories()">Categorias</a></li>
    </ul>

    <!-- Lista -->
    <div *ngIf="tab==='list'">
      <div class="row g-2 mb-3">
        <div class="col-md-3">
          <label class="form-label form-label-sm">Materia</label>
          <select class="form-select form-select-sm" [(ngModel)]="filterSubjectId" (change)="loadQuestions()">
            <option [ngValue]="null">Todas</option>
            <option *ngFor="let s of subjects" [ngValue]="s.id">{{s.name}}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label form-label-sm">Buscar</label>
          <input class="form-control form-control-sm" [(ngModel)]="searchTerm" placeholder="Texto o etiqueta..." (keyup.enter)="searchQuestions()">
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button class="btn btn-sm btn-outline-primary" (click)="searchQuestions()">Buscar</button>
        </div>
      </div>

      <!-- Stats -->
      <div class="row g-2 mb-3" *ngIf="stats">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
            <div class="small text-muted">Total Preguntas</div><div class="fs-5 fw-bold" style="color:#3B4436">{{stats.total}}</div>
          </div></div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
            <div class="small text-muted">Faciles</div><div class="fs-5 fw-bold text-success">{{stats.byDifficulty?.EASY || 0}}</div>
          </div></div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
            <div class="small text-muted">Medias</div><div class="fs-5 fw-bold text-warning">{{stats.byDifficulty?.MEDIUM || 0}}</div>
          </div></div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
            <div class="small text-muted">Dificiles</div><div class="fs-5 fw-bold text-danger">{{stats.byDifficulty?.HARD || 0}}</div>
          </div></div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead>
            <tr><th>Pregunta</th><th>Materia</th><th>Tipo</th><th>Dificultad</th><th>Pts</th><th></th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let q of questions">
              <td class="cell-truncate">{{q.questionText}}</td>
              <td>{{q.subjectName}}</td>
              <td><span class="badge text-bg-secondary">{{typeLabel(q.questionType)}}</span></td>
              <td>
                <span class="badge" [class.text-bg-success]="q.difficulty==='EASY'" [class.text-bg-warning]="q.difficulty==='MEDIUM'" [class.text-bg-danger]="q.difficulty==='HARD'">
                  {{diffLabel(q.difficulty)}}
                </span>
              </td>
              <td>{{q.points}}</td>
              <td>
                <button class="btn btn-sm btn-outline-danger" (click)="deactivateQuestion(q.id)">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="questions.length===0"><td colspan="6" class="text-muted text-center">No hay preguntas</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Nueva Pregunta -->
    <div *ngIf="tab==='new'">
      <div class="card">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Materia</label>
              <select class="form-select form-select-sm" [(ngModel)]="formSubjectId">
                <option [ngValue]="null">Seleccionar...</option>
                <option *ngFor="let s of subjects" [ngValue]="s.id">{{s.name}}</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Categoria</label>
              <select class="form-select form-select-sm" [(ngModel)]="formCategoryId">
                <option [ngValue]="null">Ninguna</option>
                <option *ngFor="let c of categories" [ngValue]="c.id">{{c.name}}</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="formType">
                <option value="OPEN">Abierta</option>
                <option value="MULTIPLE_CHOICE">Multiple_choice</option>
                <option value="TRUE_FALSE">Verdadero/Falso</option>
                <option value="FILL_BLANK">Completar</option>
                <option value="ESSAY">Ensayo</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Dificultad</label>
              <select class="form-select form-select-sm" [(ngModel)]="formDifficulty">
                <option value="EASY">Facil</option>
                <option value="MEDIUM">Media</option>
                <option value="HARD">Dificil</option>
              </select>
            </div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-9">
              <label class="form-label form-label-sm">Pregunta</label>
              <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="formQuestionText" placeholder="Escriba la pregunta..."></textarea>
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Puntos</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="formPoints" min="0.5" step="0.5">
              <label class="form-label form-label-sm mt-2">Etiquetas</label>
              <input class="form-control form-control-sm" [(ngModel)]="formTags" placeholder="separadas por coma">
            </div>
          </div>
          <div class="row g-2 mt-1" *ngIf="formType==='MULTIPLE_CHOICE'">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Opcion A</label>
              <input class="form-control form-control-sm" [(ngModel)]="formOptionA">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Opcion B</label>
              <input class="form-control form-control-sm" [(ngModel)]="formOptionB">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Opcion C</label>
              <input class="form-control form-control-sm" [(ngModel)]="formOptionC">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Opcion D</label>
              <input class="form-control form-control-sm" [(ngModel)]="formOptionD">
            </div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-6">
              <label class="form-label form-label-sm">Respuesta Correcta</label>
              <input class="form-control form-control-sm" [(ngModel)]="formCorrectAnswer">
            </div>
            <div class="col-md-6">
              <label class="form-label form-label-sm">Explicacion</label>
              <input class="form-control form-control-sm" [(ngModel)]="formExplanation">
            </div>
          </div>
          <div class="mt-3">
            <button class="btn btn-sm btn-primary" (click)="createQuestion()" [disabled]="!formSubjectId || !formQuestionText">Guardar Pregunta</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Categorias -->
    <div *ngIf="tab==='catalog'">
      <div class="d-flex justify-content-end mb-2">
        <button class="btn btn-sm btn-primary" (click)="showCatForm=true; resetCatForm()">+ Nueva Categoria</button>
      </div>
      <div *ngIf="showCatForm" class="card mb-3">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-4">
              <label class="form-label form-label-sm">Nombre</label>
              <input class="form-control form-control-sm" [(ngModel)]="catFormName">
            </div>
            <div class="col-md-4">
              <label class="form-label form-label-sm">Descripcion</label>
              <input class="form-control form-control-sm" [(ngModel)]="catFormDescription">
            </div>
            <div class="col-md-4 d-flex align-items-end gap-1">
              <button class="btn btn-sm btn-primary" (click)="createCategory()">Guardar</button>
              <button class="btn btn-sm btn-outline-secondary" (click)="showCatForm=false">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>Nombre</th><th>Descripcion</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let c of categories">
              <td>{{c.name}}</td>
              <td class="small text-muted">{{c.description || '-'}}</td>
              <td><button class="btn btn-sm btn-outline-danger" (click)="deleteCategory(c.id)">Eliminar</button></td>
            </tr>
            <tr *ngIf="categories.length===0"><td colspan="3" class="text-muted text-center">No hay categorias</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!messageIsError" [class.bg-danger]="messageIsError">
        <div class="toast-body text-white">{{message}}</div>
      </div>
    </div>
  `
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
