import t from 'prop-types';
import dayjs from 'dayjs';
import useCountdownTimer from '~/shared/useCountdownTimer';

const _1_SECOND_IN_MILISECONDS = 1000;
const _5_MINUTES_IN_MILISECONDS = 5 * 60 * 1000;
const _1_DAY_IN_SECONDS = 24 * 60 * 60;

export function useRemainingTime(initialValueSeconds) {
  const remainingTime = useCountdownTimer({
    seconds: initialValueSeconds,
    refreshInterval: remainingTimeInSeconds =>
      remainingTimeInSeconds < _1_DAY_IN_SECONDS ? _1_SECOND_IN_MILISECONDS : _5_MINUTES_IN_MILISECONDS,
  });

  return remainingTime;
}

function RemainingTime({ initialValueSeconds, render, showPrefix }) {
  const remainingTime = useRemainingTime(initialValueSeconds);

  const endingSoon = remainingTime < _1_DAY_IN_SECONDS;
  const formattedValue =
    remainingTime === 0
      ? '00:00:00'
      : remainingTime < _1_DAY_IN_SECONDS
      ? dayjs().startOf('day').add(remainingTime, 'second').format('HH:mm:ss')
      : dayjs().add(remainingTime, 'second').fromNow(!showPrefix);

  return render({ value: remainingTime, formattedValue, endingSoon });
}

const defaultRender = ({ formattedValue }) => formattedValue;

RemainingTime.propTypes = {
  initialValueSeconds: t.number.isRequired,
  render: t.func,
  showPrefix: t.bool,
};

RemainingTime.defaultProps = {
  initialValueSeconds: 0,
  render: defaultRender,
  showPrefix: false,
};

export default RemainingTime;
