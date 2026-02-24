 'use client';

import React from 'react';
import ReactDOM from 'react-dom';

// Модуль-обёртка над Yandex Maps v3 для React (reactify).
// Важно: этот файл должен использоваться только на клиенте.

const [ymaps3React] = await Promise.all([
  // Импорт React-обёртки для ymaps3
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error глобальный объект ymaps3 приходит из <script> в HTML
  ymaps3.import('@yandex/ymaps3-reactify'),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error глобальный объект ymaps3 приходит из <script> в HTML
  ymaps3.ready,
]);

// Привязываем reactify к React/ReactDOM
export const reactify = ymaps3React.reactify.bindTo(React, ReactDOM);

// Достаём нужные компоненты карты
export const {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker,
} = reactify.module(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error глобальный объект ymaps3 приходит из <script> в HTML
  ymaps3,
);

// Контекст типа карты (map / future-map и т.п.) и его React-обёртка
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error глобальный объект ymaps3 приходит из <script> в HTML
export const { YMapTypeContext } = ymaps3;

export const YMapTypeReactContext = reactify.context(YMapTypeContext);

