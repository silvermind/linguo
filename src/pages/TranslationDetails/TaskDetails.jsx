import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Typography } from 'antd';
import { FileTextOutlined, TranslationOutlined, LinkOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Task, TaskStatus, useCacheCall, getFileUrl } from '~/app/linguo';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import languages from '~/assets/fixtures/languages';
import getLanguageFlag from '~/components/helpers/getLanguageFlag';
import { CalendarIcon } from '~/components/icons';
import Button from '~/components/Button';
import Spacer from '~/components/Spacer';
import FormattedDate from '~/components/FormattedDate';
import FormattedNumber from '~/components/FormattedNumber';
import TranslationQualityDefinition from '~/components/TranslationQualityDefinition';
import TaskInfoGrid from '~/components/TaskInfoGrid';
import TaskPrice from '~/components/TaskPrice';
import DownloadLink from '~/components/DownloadLink';
import TaskContext from './TaskContext';
import TaskStatusDetails from './TaskStatusDetails';

const _1_MINUTE_IN_MILLISECONDS = 60 * 1000;

function TaskDetails() {
  const task = React.useContext(TaskContext);
  const {
    ID,
    status,
    title,
    deadline,
    assignedPrice,
    expectedQuality,
    text,
    wordCount,
    sourceLanguage,
    targetLanguage,
    originalTextUrl,
    originalTextFile,
    translatedTextUrl,
  } = task;

  // const translatedTextUrl='';

  const hasAssignedPrice = assignedPrice !== undefined;

  const refreshInterval = hasAssignedPrice || Task.isIncomplete(task) ? 0 : _1_MINUTE_IN_MILLISECONDS;
  const shouldRevalidate = !hasAssignedPrice;

  const [{ data: currentPrice }] = useCacheCall(['getTaskPrice', ID], {
    initialData: Task.currentPrice(task),
    revalidateOnFocus: shouldRevalidate,
    revalidateOnReconnect: shouldRevalidate,
    refreshInterval,
  });
  const actualPrice = assignedPrice ?? currentPrice;

  const pricePerWord = Task.currentPricePerWord({
    currentPrice: actualPrice,
    wordCount,
  });

  const { name = '', requiredLevel = '' } = translationQualityTiers[expectedQuality] || {};

  const showFootnote = status === TaskStatus.Created && !Task.isIncomplete(task);

  const taskInfo = [
    {
      title: 'Price per word',
      content: <TaskPrice showTooltip value={pricePerWord} />,
    },
    {
      title: 'Number of words',
      content: <FormattedNumber value={wordCount} />,
    },
    {
      title: 'Total Price',
      content: <TaskPrice showTooltip showFootnoteMark={showFootnote} value={actualPrice} />,
    },
    {
      title: name,
      content: requiredLevel,
    },
  ];

  const viewOriginalText = (
    <>
      <DownloadLink
        download={{
          content: text,
        }}
      >
        <JumboButton fullWidth={true} variant="filled" icon={<FileTextOutlined />}>
          View Original Text
        </JumboButton>
      </DownloadLink>
      {(originalTextUrl || originalTextFile) && (
        <>
          <Spacer size={1} />
          <StyledLinkList>
            {originalTextUrl ? (
              <StyledLinkListItem>
                <a href={originalTextUrl} target="_blank" rel="noopener noreferrer external">
                  <LinkOutlined /> Source of the original text
                </a>
              </StyledLinkListItem>
            ) : null}
            {originalTextFile ? (
              <StyledLinkListItem>
                <a href={getFileUrl(originalTextFile)} target="_blank" rel="noopener noreferrer external">
                  <PaperClipOutlined /> File of the original text
                </a>
              </StyledLinkListItem>
            ) : null}
          </StyledLinkList>
        </>
      )}
    </>
  );

  return (
    <div
      css={`
        @media (min-width: 576px) {
          margin-top: -2rem;
        }
      `}
    >
      <StyledTaskTitle level={2}>{title}</StyledTaskTitle>
      <StyledDeadline>
        <StyledDefinitionTerm>
          <CalendarIcon /> Translation Deadline:{' '}
        </StyledDefinitionTerm>
        <StyledDefinitionDescription>
          <FormattedDate value={deadline} month="long" hour="2-digit" minute="2-digit" timeZoneName="short" />
        </StyledDefinitionDescription>
      </StyledDeadline>
      <Spacer size={3} />
      <TaskInfoGrid data={taskInfo} />
      {showFootnote && (
        <>
          <Spacer baseSize="xs" />
          <StyledFootnote>
            <sup>*</sup>Approximate value: the actual price is defined when a translator is assigned to the task.
          </StyledFootnote>
        </>
      )}
      <Spacer size={3} />
      <StyledLanguageInfoWrapper>
        <div className="col source">
          <StyledDefinitionTerm>Source Language</StyledDefinitionTerm>
          <StyledDefinitionDescription>
            <LanguageInfo language={sourceLanguage} />
          </StyledDefinitionDescription>
        </div>
        <div className="col target">
          <StyledDefinitionTerm>Target Language</StyledDefinitionTerm>
          <StyledDefinitionDescription>
            <LanguageInfo language={targetLanguage} />
          </StyledDefinitionDescription>
        </div>
      </StyledLanguageInfoWrapper>
      <Spacer size={3} />
      <StyledExpectedQuality>
        <StyledDefinitionTerm>Expected Quality</StyledDefinitionTerm>
        <StyledDefinitionDescription>
          <TranslationQualityDefinition tierValue={expectedQuality} />
        </StyledDefinitionDescription>
      </StyledExpectedQuality>
      <Spacer size={3} />
      <StyledDownloadTextWrapper>
        {!translatedTextUrl ? (
          <div className="col">{viewOriginalText}</div>
        ) : (
          <>
            <div className="col">{viewOriginalText}</div>
            <div className="col">
              <DownloadLink
                download={{
                  url: translatedTextUrl,
                }}
              >
                <JumboButton fullWidth={true} variant="outlined" icon={<TranslationOutlined />}>
                  View Translated Text
                </JumboButton>
              </DownloadLink>
            </div>
          </>
        )}
      </StyledDownloadTextWrapper>
      <Spacer size={3} />
      <TaskStatusDetails />
    </div>
  );
}

export default TaskDetails;

const StyledTaskTitle = styled(Typography.Title)`
  && {
    font-size: ${p => p.theme.fontSize.xxl};
    text-align: center;
  }
`;

const StyledDefinitionList = styled.dl`
  display: block;
  margin: 0;
`;

const StyledDefinitionTerm = styled.dt`
  font-size: ${p => p.theme.fontSize.lg};
  margin-bottom: 1rem;
`;

const StyledDefinitionDescription = styled.dd`
  font-size: inherit;
`;

const StyledDeadline = styled(StyledDefinitionList)`
  && {
    font-size: ${p => p.theme.fontSize.sm};
    font-weight: 400;
    text-align: center;

    ${StyledDefinitionTerm} {
      font-size: inherit;
      font-weight: inherit;
      margin: 0;
    }

    ${StyledDefinitionTerm},
    ${StyledDefinitionDescription} {
      display: inline;
    }
  }
`;

const StyledFootnote = styled(Typography.Paragraph)`
  && {
    margin: 0;
    font-size: ${p => p.theme.fontSize.sm};
  }
`;

const StyledLanguageInfoWrapper = styled(StyledDefinitionList)`
  text-align: center;
  display: flex;
  justify-content: center;

  .col {
    min-width: 0;
    max-width: 20rem;
    flex: 20rem 1 1;

    &.target {
      margin-left: 1rem;
    }
  }

  @media (max-width: 767.98px) {
    flex-wrap: wrap;

    .col {
      &.target {
        margin-left: 0;
        margin-top: 2rem;
      }
    }
  }
`;

const StyledExpectedQuality = styled(StyledDefinitionList)`
  ${StyledDefinitionTerm} {
    text-align: center;
  }
`;

const indexedLanguages = languages.reduce((acc, item) => Object.assign(acc, { [item.code]: item }), {});

function LanguageInfo({ language }) {
  const languageName = indexedLanguages[language].name || '<Unknown>';
  const FlagIcon = getLanguageFlag(language);

  return (
    <StyledLanguageDisplay>
      <FlagIcon className="flag" />
      <span className="name">{languageName}</span>
    </StyledLanguageDisplay>
  );
}

LanguageInfo.propTypes = {
  language: t.string.isRequired,
};

const StyledLanguageDisplay = styled.div`
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 5px solid ${p => p.theme.color.border.default};
  background-image: linear-gradient(
    122.98deg,
    ${p => p.theme.color.primary.default} 40.84%,
    ${p => p.theme.color.primary.dark} 89.37%
  );
  color: ${p => p.theme.color.text.inverted};
  font-size: ${p => p.theme.fontSize.xxl};

  display: flex;
  justify-content: center;
  align-items: center;

  .flag {
    width: 2rem;
    height: 2rem;
  }

  .name {
    flex: auto 0 1;
    margin-left: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StyledDownloadTextWrapper = styled.div`
  text-align: center;
  display: flex;
  justify-content: center;

  .col {
    min-width: 0;
    flex: 22rem 0 1;

    :first-child:not(only-child) {
      margin-right: 1rem;
    }
  }

  @media (max-width: 991.98px) {
    flex-wrap: wrap;

    .col {
      :first-child:not(only-child) {
        margin-right: 0;
        margin-bottom: 2rem;
      }
    }
  }
`;

const JumboButton = styled(Button)`
  font-size: ${p => p.theme.fontSize.xxl};
  height: 6rem;
  border-radius: 0.75rem;
  padding: 0 2rem;
  border: 5px solid ${p => p.theme.color.border.default};
  max-width: 100%;

  &.ant-btn {
    :hover,
    :focus {
      border-color: ${p => p.theme.color.border.default};
    }
  }

  @media (max-width: 575.98px) {
    display: block;
    width: 100%;
  }
`;

const StyledLinkList = styled.ul`
  padding: 0;
  margin: 0;
`;

const StyledLinkListItem = styled.li`
  list-style: none;
  margin: 0;

  & + & {
    margin-top: 0.25rem;
  }
`;