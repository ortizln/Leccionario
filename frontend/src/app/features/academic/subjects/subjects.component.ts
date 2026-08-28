import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AcademicTeacher } from '../academic.models';
import { AuthService } from '../../../core/auth.service';

type Subject = { id: number; name: string; code: string; curriculumArea: string };

@Component({
  templateUrl: './subjects.component.html',
  styleUrl: './subjects.component.css',
    selector: 'app-academic-subjects',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
})
export class SubjectsComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  canManageAcademic = this.auth.hasPermission('ACADEMIC_MANAGE');

  subjects: Subject[] = [];
  teachers: AcademicTeacher[] = [];
  areas: string[] = [];
  editorOpen = false;
  editingId: number | null = null;
  selectedSubjectId: number | null = null;
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    curriculumArea: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      overview: this.http.get<{ subjects: Subject[]; teachers: AcademicTeacher[] }>(`${API_URL}/academic/overview`),
      teachersList: this.http.get<AcademicTeacher[]>(`${API_URL}/academic/teachers`).pipe(
        catchError(() => of([]))
      ),
      areas: this.http.get<Array<{ name: string }>>(`${API_URL}/academic/areas`).pipe(
        catchError(() => of(null))
      )
    }).pipe(
      catchError(() => of({ overview: { subjects: [], teachers: [] }, teachersList: [], areas: null }))
    ).subscribe(({ overview, teachersList, areas }) => {
      this.subjects = overview.subjects;
      this.teachers = teachersList.length > 0 ? teachersList : overview.teachers;
      if (areas) {
        this.areas = areas.map(a => a.name);
      } else {
        this.areas = [...new Set(overview.subjects.map(s => s.curriculumArea))].sort();
      }
    });
  }

  subjectsByArea(area: string): Subject[] {
    return this.subjects.filter(s => s.curriculumArea === area);
  }

  groupedSubjects(): Array<{ area: string; subjects: Subject[] }> {
    const map = new Map<string, Subject[]>();
    for (const s of this.subjects) {
      if (!map.has(s.curriculumArea)) {
        map.set(s.curriculumArea, []);
      }
      map.get(s.curriculumArea)!.push(s);
    }
    return Array.from(map.entries())
      .map(([area, subjects]) => ({ area, subjects }))
      .sort((a, b) => a.area.localeCompare(b.area));
  }

  areaTeachers(area: string): AcademicTeacher[] {
    const term = area.toLowerCase();
    return this.teachers.filter(t =>
      t.specialization.toLowerCase().includes(term)
    );
  }

  toggleTeacherPanel(subject: Subject): void {
    this.selectedSubjectId = this.selectedSubjectId === subject.id ? null : subject.id;
  }

  startCreate(): void {
    this.editingId = null;
    this.editorOpen = true;
    this.form.reset({ name: '', code: '', curriculumArea: '' });
  }

  edit(subject: Subject): void {
    this.editingId = subject.id;
    this.editorOpen = true;
    this.form.setValue({
      name: subject.name,
      code: subject.code,
      curriculumArea: subject.curriculumArea
    });
  }

  cancelEdit(): void {
    this.editorOpen = false;
    this.editingId = null;
    this.form.reset({ name: '', code: '', curriculumArea: '' });
  }

  save(): void {
    if (!this.canManageAcademic || this.form.invalid) return;
    const payload = this.form.getRawValue();
    const url = this.editingId
      ? `${API_URL}/academic/subjects/${this.editingId}`
      : `${API_URL}/academic/subjects`;
    const request$ = this.editingId
      ? this.http.put(url, payload)
      : this.http.post(url, payload);

    request$.subscribe({
      next: () => {
        this.cancelEdit();
        this.loadData();
      },
      error: () => {}
    });
  }

  toggleSubjectAssignment(teacher: AcademicTeacher, subject: Subject, assign: boolean): void {
    if (!this.canManageAcademic) return;
    let updated = [...teacher.subjects];
    if (assign) {
      if (!updated.includes(subject.name)) {
        updated.push(subject.name);
      }
    } else {
      updated = updated.filter(s => s !== subject.name);
    }
    this.http.put(`${API_URL}/academic/teachers/${teacher.id}`, { ...teacher, subjects: updated }).pipe(
      catchError(() => {
        return of(null);
      })
    ).subscribe({
      next: () => {
        const idx = this.teachers.findIndex(t => t.id === teacher.id);
        if (idx !== -1) {
          this.teachers[idx] = { ...this.teachers[idx], subjects: updated };
        }
        if (assign) {
          this.selectedSubjectId = subject.id;
        }
      }
    });
  }
}
