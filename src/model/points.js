const points = [
  {
    id: '1',
    type: 'taxi',
    destinationId: '1',
    offersIds: ['1'],
    basePrice: 20,
    dateFrom: '2019-03-18T10:30',
    dateTo: '2019-03-18T11:00',
    isFavorite: true
  },
  {
    id: '2',
    type: 'flight',
    destinationId: '3',
    offersIds: ['4', '5'],
    basePrice: 160,
    dateFrom: '2019-03-18T12:25',
    dateTo: '2019-03-18T13:35',
    isFavorite: false
  },
  {
    id: '3',
    type: 'drive',
    destinationId: '3',
    offersIds: ['8'],
    basePrice: 160,
    dateFrom: '2019-03-18T14:30',
    dateTo: '2019-03-18T16:05',
    isFavorite: true
  }
];

export {points};