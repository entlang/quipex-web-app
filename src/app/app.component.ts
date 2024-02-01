import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { DialogComponent } from './components/dialog/dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [CommonModule, RouterOutlet, MatDialogModule, MatButtonModule]
})
export class AppComponent {
  private dialog = inject(MatDialog);
  private dialogRef!: MatDialogRef<DialogComponent>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogComponent,{
      panelClass: 'scalableDialog'
    });

    this.dialogRef.afterClosed().subscribe({
      next: (result) => console.log(`Dialog result: ${JSON.stringify(result)}`),
    });
  }
}
