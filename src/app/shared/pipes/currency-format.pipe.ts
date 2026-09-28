import { Pipe, PipeTransform, inject } from '@angular/core';
import { SettingsService } from '../../core/services/settings.service';

@Pipe({ name: 'appCurrency', standalone: true })
export class CurrencyFormatPipe implements PipeTransform {
  private settings = inject(SettingsService);
  transform(value: number): string {
    return this.settings.formatAmount(value ?? 0);
  }
}