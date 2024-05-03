import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { AsyncPipe, DatePipe, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonAvatar,
  IonBadge,
  IonChip,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkboxOutline, squareOutline, add } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface Task {
  id: number;
  text: string;
  done: boolean;
  created: Date;
  finished?: Date;
}

@Component({
  selector: 'app-todo',
  templateUrl: './todo.page.html',
  styleUrls: ['./todo.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    FormsModule,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonChip,
    IonRow,
    IonCol,
    DatePipe,
    AsyncPipe,
    IonBadge,
    JsonPipe,
    IonFab,
    IonFabButton,
    IonAvatar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoPage {
  private readonly toastCtrl = inject(ToastController);
  private readonly http = inject(HttpClient);

  /*

  Signals are Memoized

  First time they're called, they run and generate a value for an input
  The second time they are called, or nth time, if the signal hasn't received
  any update, then it's not going to call the function, and just
  return the previous value.

  Signal knows if it has changed or not.

  "Activity" --> Nothing has changed --> Send back "Activity"

  ... change detection runs for other stuff | "Activity"
  ... change detection runs for other stuff | "Activity"
  ... change detection runs for other stuff | "Activity"
  ... change detection runs for other stuff | "Activity"
  "Activity" set "Activity 2"
  ... change detection runs for other stuff | Signal has changed | re-run --> "Activity 2"
  ... change detection runs for other stuff | "Activity 2"
  ... change detection runs for other stuff | "Activity 2"
  ... change detection runs for other stuff | "Activity 2"
  ... change detection runs for other stuff | "Activity 2"


   */

  tasks = signal<Array<Task> | undefined>(undefined);
  searchText = signal<string | undefined>(undefined);

  filteredTasks = computed(() => {
    const tasks = this.tasks() ?? [];
    const search = this.searchText();
    return tasks
      .filter((task) =>
        (search ?? '').length > 0
          ? task.text.toUpperCase().includes((search ?? '').toUpperCase())
          : true,
      )
      .sort((a, b) => (a.done === b.done ? a.id - b.id : b.done ? 0 : 1));
  });

  characters = toSignal(
    this.http
      .get('https://rickandmortyapi.com/api/character')
      .pipe(map((response: any) => response.results)),
  );

  constructor() {
    afterNextRender(() => {
      const tasks = JSON.parse(window.localStorage.getItem('tasks') ?? '[]');
      this.tasks.set(tasks);
      const currentSearch = window.localStorage.getItem('search') ?? '';
      this.searchText.set(currentSearch);
    });

    effect(() => {
      const currentSearch = this.searchText();
      if (currentSearch) {
        window.localStorage.setItem('search', currentSearch);
      }
      console.log('change in the search', currentSearch);
    });

    effect(() => {
      const tasks = this.tasks();
      console.log('Change in tasks!', tasks);
      if (tasks) {
        window.localStorage.setItem('tasks', JSON.stringify(tasks));
      }
    });

    addIcons({
      squareOutline,
      checkboxOutline,
      add,
    });
  }

  async addTodo() {
    this.tasks.set([
      ...(this.tasks() ?? []),
      {
        id: parseInt(`${Math.random() * 300}`),
        text: `New activity ${new Date()}`,
        created: new Date(),
        done: false,
      },
    ]);
  }

  async updateTask(task: Task) {
    if (await this.toastCtrl.getTop()) {
      this.toastCtrl.dismiss();
    }
    const done = !task.done;
    this.tasks.set([
      ...(this.tasks() ?? []).filter((t) => t.id !== task.id),
      {
        ...task,
        done,
      },
    ]);

    const message: string = done
      ? `Task ${task.text} completed`
      : `Task ${task.text} marked as pending`;
    (
      await this.toastCtrl.create({
        message,
        duration: 2000,
        color: done ? 'success' : 'primary',
      })
    ).present();

    // this.tasks = this.tasks.sort((a, b) =>
    //   a.done === b.done ? a.id - b.id : a.done === b.done ? 0 : b.done ? -1 : 1,
    // );
  }
}
