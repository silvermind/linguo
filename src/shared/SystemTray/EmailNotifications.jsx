import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Form, Checkbox, Input, Row, notification } from 'antd';
import Button from '~/shared/Button';
import ContentBlocker from '~/shared/ContentBlocker';
import { EmailIcon } from '~/shared/icons';
import { Popover, Button as TrayButton, withToolbarStylesIcon } from './adapters';

const StyledForm = styled(Form)`
  padding-top: 1rem;
`;

const StyleFormButtonRow = styled(Row)`
  display: flex;
  justify-content: flex-end;
`;

const settings = {
  delivery: 'The translator delivers the translation (Review Time).',
  challenge: 'The translation is challenged and goes to arbitration.',
  ruling: 'The jurors rule about the translation.',
};

function EmailNotificationsForm({ onSubmit }) {
  const [form] = Form.useForm();

  const initialValues = {
    delivery: false,
    challenge: false,
    ruling: false,
  };

  const onFinish = React.useCallback(
    values => {
      notification.success({
        message: "You've updated your e-mail subscription settings!",
        placement: 'bottomRight',
        duration: 10,
      });
      onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <StyledForm form={form} initialValues={initialValues} onFinish={onFinish} layout="vertical" scrollToFirstError>
      {Object.entries(settings).map(([key, label]) => (
        <Form.Item key={key} name={key} valuePropName="checked">
          <Checkbox>{label}</Checkbox>
        </Form.Item>
      ))}
      <Form.Item
        name={'email'}
        rules={[
          {
            message: 'Please enter your email.',
            required: true,
          },
          {
            message: 'Please enter a valid email.',
            type: 'email',
          },
        ]}
      >
        <Input placeholder="E-mail" />
      </Form.Item>
      <StyleFormButtonRow>
        <Button htmlType="submit">Subscribe</Button>
      </StyleFormButtonRow>
    </StyledForm>
  );
}

EmailNotificationsForm.propTypes = {
  onSubmit: t.func,
};

EmailNotificationsForm.defaultProps = {
  onSubmit: () => {},
};

const StyledPopover = styled(Popover)`
  width: 28rem;
`;

const StyledEmailIcon = withToolbarStylesIcon(EmailIcon);

function EmailNotifications() {
  const [visible, setVisible] = React.useState(false);

  const handleVisibilityChange = React.useCallback(visible => {
    setVisible(visible);
  }, []);

  const handleFormSubmit = React.useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <StyledPopover
      arrowPointAtCenter
      content={
        <ContentBlocker
          blocked
          contentBlur={2}
          overlayText={
            <div
              css={`
                transform: rotate(-30deg);
                color: ${p => p.theme.color.danger.default};
                background-color: ${p => p.theme.color.background.light};
                padding: 0.5rem 1rem;
                border-radius: 0.75rem;
                font-size: ${p => p.theme.fontSize.xxl};
                text-align: center;
                white-space: nowrap;
              `}
            >
              Coming soon...
            </div>
          }
        >
          <EmailNotificationsForm onSubmit={handleFormSubmit} />
        </ContentBlocker>
      }
      placement="bottomRight"
      title="Notify me by e-mail when:"
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibilityChange}
    >
      <TrayButton shape="round">
        <StyledEmailIcon />
      </TrayButton>
    </StyledPopover>
  );
}

export default EmailNotifications;
