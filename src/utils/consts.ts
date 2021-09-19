import { PollInterval, TimeToLive } from '../types';

export const APP_TITLE = 'Sensetif';
export const APP_SUBTITLE = 'Visualizing Your Stuff';

export const API_RESOURCES = '/api/plugins/sensetif-datasource/resources/';

export const TimeToLivePeriods = {
  a: '1 week',
  b: '1 month',
  c: '3 months',
  d: '6 months',
  e: '1 year',
  f: '2 years',
  g: '3 years',
  h: '4 years',
  i: '5 years',
  j: '10 years',
  k: 'forever',
};

export const AvailableTimeToLivePeriods = [
  { label: '1 month', value: TimeToLive.b },
  { label: '3 months', value: TimeToLive.c },
  { label: '6 months', value: TimeToLive.d },
  { label: '1 year', value: TimeToLive.e },
  { label: '3 years', value: TimeToLive.g },
  { label: '5 years', value: TimeToLive.i },
];

export const PollIntervals = {
  one_minute: '1 minute',
  five_minutes: '5 minutes',
  ten_minutes: '10 minutes',
  fifteen_minutes: '15 minutes',
  twenty_minutes: '20 minutes',
  thirty_minutes: '30 minutes',
  one_hour: '1 hour',
  two_hours: '2 hours',
  three_hours: '3 hours',
  six_hours: '6 hours',
  twelve_hours: '12 hours',
  one_day: '24 hours',
  weekly: '1 week',
  monthly: '1 month',
};

export const AvailablePollIntervals = [
  { label: '5 minutes', value: PollInterval.five_minutes },
  { label: '10 minutes', value: PollInterval.ten_minutes },
  { label: '15 minutes', value: PollInterval.fifteen_minutes },
  { label: '20 minutes', value: PollInterval.twenty_minutes },
  { label: '30 minutes', value: PollInterval.thirty_minutes },
  { label: '1 hour', value: PollInterval.one_hour },
  { label: '2 hours', value: PollInterval.two_hours },
  { label: '3 hours', value: PollInterval.three_hours },
  { label: '6 hours', value: PollInterval.six_hours },
  { label: '12 hours', value: PollInterval.twelve_hours },
  { label: '24 hours', value: PollInterval.one_day },
  { label: '1 week', value: PollInterval.weekly },
  { label: '1 month', value: PollInterval.monthly },
];
