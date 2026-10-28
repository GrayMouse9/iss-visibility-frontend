import type { ObservationPoint } from '../types/observationPoint'

// Локальные данные ЛР5. Идентификаторы намеренно содержат пропуски.
export const observationPointsMock: ObservationPoint[] = [
  {
    "id": 1,
    "name": "Обсерватория Джемини-Север, Мауна-Кеа",
    "description": "Восьмиметровый телескоп на вершине вулкана, 4200 м над уровнем моря. Выше обсерватории остаётся лишь 40 % воздуха, и он почти не искажает изображение.",
    "image_url": "/media/observation-points/maunakea.jpg",
    "video_url": "/media/observation-points/maunakea.mp4",
    "latitude": 19.8207,
    "longitude": -155.4681,
    "likes": 0
  },
  {
    "id": 2,
    "name": "Национальная обсерватория Китт-Пик, Аризона",
    "description": "Более двадцати телескопов на одной горе в пустыне Сонора. Ясных ночей здесь около 260 в году, что делает площадку удобной для регулярных наблюдений.",
    "image_url": "/media/observation-points/kittpeak.jpg",
    "video_url": "/media/observation-points/kittpeak.mp4",
    "latitude": 31.9583,
    "longitude": -111.5967,
    "likes": 0
  },
  {
    "id": 4,
    "name": "Обсерватория ALMA, плато Чахнантор",
    "description": "Шестьдесят шесть антенн на высоте 5000 м — самая высокогорная обсерватория мира. Воздух предельно сух, помех для наблюдения практически нет.",
    "image_url": "/media/observation-points/alma.jpg",
    "video_url": "/media/observation-points/alma.mp4",
    "latitude": -23.0294,
    "longitude": -67.7548,
    "likes": 0
  },
  {
    "id": 5,
    "name": "Паранальская обсерватория, Атакама",
    "description": "Четыре восьмиметровых телескопа в пустыне Атакама. Осадки здесь почти не выпадают, а ясных ночей больше трёхсот в году.",
    "image_url": "/media/observation-points/paranal.jpg",
    "video_url": "/media/observation-points/paranal.mp4",
    "latitude": -24.6275,
    "longitude": -70.4044,
    "likes": 0
  },
  {
    "id": 6,
    "name": "Обсерватория Ла-Силья, Чили",
    "description": "Первая площадка Южной европейской обсерватории, работает с 1969 года. До ближайшего города сотни километров, поэтому небо здесь остаётся полностью тёмным.",
    "image_url": "/media/observation-points/lasilla.jpg",
    "video_url": "/media/observation-points/lasilla.mp4",
    "latitude": -29.2567,
    "longitude": -70.73,
    "likes": 0
  },
  {
    "id": 8,
    "name": "Учебная точка, Москва",
    "description": "Демонстрационная точка без фотографии и видео для проверки медиа по умолчанию.",
    "image_url": "",
    "video_url": "",
    "latitude": 55.766,
    "longitude": 37.6849,
    "likes": 0
  }
]
