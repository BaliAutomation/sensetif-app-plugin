import { dateTimeParse, GrafanaTheme2 } from '@grafana/data';
import { Alert, Icon, useTheme2 } from '@grafana/ui';
import * as React from 'react';
import { Timeline as ReactTimeline, TimelineEvent } from 'react-event-timeline';

export interface Event {
  time: Date;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  details?: React.ReactNode;
}

interface Props {
  events: Event[];
  reversed?: boolean;
}

export const Timeline = (props: Props) => {
  const theme = useTheme2();

  let events = props.events.map((event, idx) => {
    return (
      <TimelineEvent
        key={idx}
        icon={getIcon(event)}
        iconColor={getIconColor(event, theme)}
        title={event.title}
        subtitle={event.subtitle}
        createdAt={dateTimeParse(event.time).toString()}
        style={getTimelineStyle(theme)}
        contentStyle={getContentStyle(theme)}
        bubbleStyle={getBubbleStyle(theme)}
        titleStyle={getTitleStyle(theme)}
        subtitleStyle={getSubtitleStyle(theme)}
      >
        {event.content}

        {event.details && (
          <div style={{ marginTop: '5px' }}>
            <details>
              <summary>Error details</summary>
              <Alert title="Error details" severity="warning">
                {event.details}
              </Alert>
            </details>
          </div>
        )}
      </TimelineEvent>
    );
  });

  if (props.reversed) {
    events = events.reverse();
  }

  return (
    <ReactTimeline
      style={{
        backgroundColor: theme.colors.background.primary,
      }}
    >
      {events}
    </ReactTimeline>
  );
};

const getIcon = (event: Event): React.ReactNode => {
  if (event.details) {
    return <Icon name="heart-break" />;
  }

  return <Icon name="info" />;
};

const getIconColor = (event: Event, theme: GrafanaTheme2): string => {
  if (event.details) {
    return theme.colors.error.border;
  }

  return theme.colors.info.border;
};

const getTimelineStyle = (theme: GrafanaTheme2): React.CSSProperties => {
  return {
    backgroundColor: theme.colors.background.primary,
    color: theme.colors.text.primary,
  };
};

const getContentStyle = (theme: GrafanaTheme2): React.CSSProperties => {
  return {
    backgroundColor: theme.colors.background.secondary,
    color: theme.colors.text.secondary,
  };
};

const getBubbleStyle = (theme: GrafanaTheme2): React.CSSProperties => {
  return {
    backgroundColor: theme.colors.background.secondary,
  };
};

const getTitleStyle = (theme: GrafanaTheme2): React.CSSProperties => {
  return {
    color: theme.colors.text.primary,
  };
};

const getSubtitleStyle = (theme: GrafanaTheme2): React.CSSProperties => {
  return {
    color: theme.colors.text.secondary,
  };
};
