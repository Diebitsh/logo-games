import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Highlight {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-get-started',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './get-started.component.html',
  styleUrl: './get-started.component.scss',
})
export class GetStartedComponent {
  highlights: Highlight[] = [
    {
      icon: 'fi-rr-wand-magic-sparkles',
      title: 'Конструктор игр',
      description:
        'Соберите игру под конкретного ребёнка: восемь направлений работы, любые звуки, ваши картинки и аудио — без программирования.',
    },
    {
      icon: 'fi-rr-puzzle-alt',
      title: 'Готовые сценарии',
      description:
        'Игры по лексическим темам и группам звуков. Можно отрабатывать слух, анализ звуков и преобразование слов.',
    },
    {
      icon: 'fi-rr-eye',
      title: 'Версия для слабовидящих',
      description:
        'Контрастная тема, регулируемый шрифт, межстрочный интервал и озвучивание интерфейса при наведении.',
    },
    {
      icon: 'fi-rr-mobile-notch',
      title: 'Адаптивно и мобильно',
      description:
        'Удобный интерфейс на любом устройстве. Доступно как нативное приложение для Android и iOS.',
    },
  ];

  steps = [
    {
      step: '01',
      title: 'Выберите направление',
      text: 'Восемь упражнений на фонематический слух и анализ.',
    },
    {
      step: '02',
      title: 'Подберите звук',
      text: 'Свистящие, шипящие, сонорные, гласные — с разделением по твёрдости.',
    },
    {
      step: '03',
      title: 'Загрузите контент',
      text: 'Перетащите картинку и аудио с правильным и неправильным ответом.',
    },
    {
      step: '04',
      title: 'Играйте и сохраняйте',
      text: 'Игра сразу попадает в «Мои игры». Можно поделиться файлом с коллегами.',
    },
  ];
}
