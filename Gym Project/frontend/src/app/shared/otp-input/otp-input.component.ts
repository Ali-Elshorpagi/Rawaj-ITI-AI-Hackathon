import { Component, Output, EventEmitter, signal, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gd-otp-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-3 justify-center">
      @for (digit of digits; track $index; let i = $index) {
        <input
          #otpInput
          type="text"
          inputmode="numeric"
          maxlength="1"
          [value]="digit()"
          (input)="onInput($event, i)"
          (keydown)="onKeydown($event, i)"
          (paste)="onPaste($event)"
          class="w-12 h-14 text-center text-2xl font-black text-white bg-[#111111] border-2 rounded-xl outline-none transition-all
                 focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 caret-[#22C55E]"
          [class.border-gray-800]="!digit()"
          [class.border-[#22C55E]]="!!digit()"
          [class.text-[#22C55E]]="!!digit()"
        >
      }
    </div>
  `,
})
export class OtpInputComponent implements AfterViewInit {
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;
  @Output() otpComplete = new EventEmitter<string>();
  @Output() otpChange   = new EventEmitter<string>();

  readonly digits = Array.from({ length: 6 }, () => signal(''));

  ngAfterViewInit(): void {
    setTimeout(() => this.inputs.first?.nativeElement.focus(), 50);
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    this.digits[index].set(val);
    input.value = val;
    this.emit();
    if (val && index < 5) {
      this.inputs.get(index + 1)?.nativeElement.focus();
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.digits[index]() && index > 0) {
      this.inputs.get(index - 1)?.nativeElement.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) this.inputs.get(index - 1)?.nativeElement.focus();
    if (event.key === 'ArrowRight' && index < 5) this.inputs.get(index + 1)?.nativeElement.focus();
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) ?? '';
    text.split('').forEach((ch, i) => {
      if (i < 6) {
        this.digits[i].set(ch);
        const el = this.inputs.get(i)?.nativeElement;
        if (el) el.value = ch;
      }
    });
    this.emit();
    const focusIdx = Math.min(text.length, 5);
    this.inputs.get(focusIdx)?.nativeElement.focus();
  }

  reset(): void {
    this.digits.forEach(d => d.set(''));
    this.inputs.first?.nativeElement.focus();
  }

  private emit(): void {
    const code = this.digits.map(d => d()).join('');
    this.otpChange.emit(code);
    if (code.length === 6) this.otpComplete.emit(code);
  }
}
