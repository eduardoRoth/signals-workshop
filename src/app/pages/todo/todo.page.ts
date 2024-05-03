import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonChip,
  IonCol,
  IonContent,
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
import { squareOutline, checkboxOutline } from 'ionicons/icons';

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
  ],
})
export class TodoPage {
  private readonly toastCtrl = inject(ToastController);
  // tasks: Array<Task> = [];
  tasks: Array<Task> = Array(20)
    .fill(0)
    .map((c, i) => ({
      id: i + 1,
      text: `Activity ${i + 1}`,
      done: false,
      created: new Date(),
    }))
    .sort((a, b) => (a.done === b.done ? 0 : b.done ? -1 : 1));

  constructor() {
    addIcons({
      squareOutline,
      checkboxOutline,
    });
  }

  async updateTask(task: Task) {
    if (await this.toastCtrl.getTop()) {
      this.toastCtrl.dismiss();
    }
    task.done = !task.done;
    task.finished = new Date();
    const message: string = task.done
      ? `Task ${task.text} completed`
      : `Task ${task.text} marked as pending`;
    (
      await this.toastCtrl.create({
        message,
        duration: 2000,
        color: task.done ? 'success' : 'primary',
      })
    ).present();

    this.tasks = this.tasks.sort((a, b) =>
      a.done === b.done
        ? a.id - b.id
        : a.done === b.done
          ? 0
          : b.done
            ? -1
            : 1,
    );
  }
}
