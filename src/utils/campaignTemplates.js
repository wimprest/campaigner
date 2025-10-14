// Pre-built campaign templates

export const campaignTemplates = {
  welcomeSeries: {
    name: 'Welcome Series',
    description: 'Onboard new customers with a 3-email welcome sequence',
    nodes: [
      {
        id: 'welcome_1',
        type: 'email',
        position: { x: 100, y: 100 },
        data: {
          label: 'Welcome Email #1',
          subject: 'Welcome! Let\'s get started',
          description: 'First touchpoint - warm welcome',
          emailContent: 'Welcome to our community! We\'re excited to have you here.',
          mjmlTemplate: null
        }
      },
      {
        id: 'delay_1',
        type: 'delay',
        position: { x: 100, y: 250 },
        data: {
          label: 'Wait 2 Days',
          duration: '2',
          unit: 'days',
          description: 'Give them time to explore'
        }
      },
      {
        id: 'welcome_2',
        type: 'email',
        position: { x: 100, y: 400 },
        data: {
          label: 'Welcome Email #2',
          subject: 'Here are some tips to get started',
          description: 'Educational content',
          emailContent: 'Here are 3 ways to make the most of your account...',
          mjmlTemplate: null
        }
      },
      {
        id: 'delay_2',
        type: 'delay',
        position: { x: 100, y: 550 },
        data: {
          label: 'Wait 3 Days',
          duration: '3',
          unit: 'days',
          description: 'Allow time for engagement'
        }
      },
      {
        id: 'welcome_3',
        type: 'email',
        position: { x: 100, y: 700 },
        data: {
          label: 'Welcome Email #3',
          subject: 'Any questions? We\'re here to help',
          description: 'Support and engagement',
          emailContent: 'How has your experience been? Need any help getting started?',
          mjmlTemplate: null
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'welcome_1', target: 'delay_1' },
      { id: 'e2', source: 'delay_1', target: 'welcome_2' },
      { id: 'e3', source: 'welcome_2', target: 'delay_2' },
      { id: 'e4', source: 'delay_2', target: 'welcome_3' }
    ]
  },

  satisfactionSurvey: {
    name: 'Customer Satisfaction Survey',
    description: 'Collect feedback with branching follow-ups',
    nodes: [
      {
        id: 'survey_email',
        type: 'email',
        position: { x: 100, y: 50 },
        data: {
          label: 'Survey Invitation',
          subject: 'How are we doing?',
          description: 'Initial survey request',
          emailContent: 'We\'d love to hear your feedback! Please take 2 minutes to complete our survey.',
          mjmlTemplate: null
        }
      },
      {
        id: 'survey_node',
        type: 'survey',
        position: { x: 100, y: 200 },
        data: {
          label: 'Satisfaction Survey',
          question: 'How satisfied are you with our service?',
          questionType: 'radio',
          description: 'Main survey question',
          responseOptions: [
            { id: 'opt_1', text: 'Very Satisfied' },
            { id: 'opt_2', text: 'Satisfied' },
            { id: 'opt_3', text: 'Neutral' },
            { id: 'opt_4', text: 'Dissatisfied' },
            { id: 'opt_5', text: 'Very Dissatisfied' }
          ],
          responsePaths: [
            {
              id: 'path_positive',
              label: 'Positive',
              mappedOptions: ['opt_1', 'opt_2'],
              color: '#4CAF50'
            },
            {
              id: 'path_neutral',
              label: 'Neutral',
              mappedOptions: ['opt_3'],
              color: '#FF9800'
            },
            {
              id: 'path_negative',
              label: 'Negative',
              mappedOptions: ['opt_4', 'opt_5'],
              color: '#F44336'
            }
          ]
        }
      },
      {
        id: 'positive_email',
        type: 'email',
        position: { x: -150, y: 400 },
        data: {
          label: 'Thank You (Positive)',
          subject: 'Thank you for your feedback!',
          description: 'Positive response follow-up',
          emailContent: 'We\'re thrilled to hear you\'re satisfied! Would you mind leaving us a review?',
          mjmlTemplate: null
        }
      },
      {
        id: 'neutral_email',
        type: 'email',
        position: { x: 100, y: 400 },
        data: {
          label: 'Follow-up (Neutral)',
          subject: 'How can we improve?',
          description: 'Neutral response follow-up',
          emailContent: 'Thanks for your feedback. What would make your experience better?',
          mjmlTemplate: null
        }
      },
      {
        id: 'negative_email',
        type: 'email',
        position: { x: 350, y: 400 },
        data: {
          label: 'Recovery (Negative)',
          subject: 'We\'re sorry - let us make it right',
          description: 'Negative response recovery',
          emailContent: 'We\'re sorry to hear about your experience. Our team will reach out to resolve this.',
          mjmlTemplate: null
        }
      },
      {
        id: 'action_alert',
        type: 'action',
        position: { x: 350, y: 550 },
        data: {
          label: 'Alert Support Team',
          actionType: 'Send alert to customer support',
          description: 'Trigger support follow-up'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'survey_email', target: 'survey_node' },
      {
        id: 'e2',
        source: 'survey_node',
        target: 'positive_email',
        sourceHandle: 'path_positive',
        label: 'Positive',
        style: { stroke: '#4CAF50' }
      },
      {
        id: 'e3',
        source: 'survey_node',
        target: 'neutral_email',
        sourceHandle: 'path_neutral',
        label: 'Neutral',
        style: { stroke: '#FF9800' }
      },
      {
        id: 'e4',
        source: 'survey_node',
        target: 'negative_email',
        sourceHandle: 'path_negative',
        label: 'Negative',
        style: { stroke: '#F44336' }
      },
      { id: 'e5', source: 'negative_email', target: 'action_alert' }
    ]
  },

  reengagementCampaign: {
    name: 'Re-engagement Campaign',
    description: 'Win back inactive customers with targeted messaging',
    nodes: [
      {
        id: 'reeng_1',
        type: 'email',
        position: { x: 200, y: 50 },
        data: {
          label: 'We Miss You Email',
          subject: 'We miss you! Here\'s what\'s new',
          description: 'Initial re-engagement attempt',
          emailContent: 'It\'s been a while! We\'ve made some exciting updates. Come check them out!',
          mjmlTemplate: null
        }
      },
      {
        id: 'conditional_1',
        type: 'conditional',
        position: { x: 200, y: 200 },
        data: {
          label: 'Check if Opened',
          condition: 'User opened email',
          truePath: 'Opened',
          falsePath: 'Not Opened',
          description: 'Track email engagement'
        }
      },
      {
        id: 'delay_opened',
        type: 'delay',
        position: { x: 50, y: 350 },
        data: {
          label: 'Wait 2 Days',
          duration: '2',
          unit: 'days',
          description: 'Follow-up delay'
        }
      },
      {
        id: 'delay_not_opened',
        type: 'delay',
        position: { x: 350, y: 350 },
        data: {
          label: 'Wait 5 Days',
          duration: '5',
          unit: 'days',
          description: 'Longer wait for non-openers'
        }
      },
      {
        id: 'engaged_email',
        type: 'email',
        position: { x: 50, y: 500 },
        data: {
          label: 'Special Offer (Engaged)',
          subject: 'Here\'s a special offer just for you',
          description: 'Reward engagement',
          emailContent: 'Since you showed interest, here\'s an exclusive 20% discount!',
          mjmlTemplate: null
        }
      },
      {
        id: 'last_chance',
        type: 'email',
        position: { x: 350, y: 500 },
        data: {
          label: 'Last Chance Email',
          subject: 'Last chance to reconnect',
          description: 'Final attempt',
          emailContent: 'This is our last email. If you\'d like to stay connected, click here. Otherwise, we\'ll respect your decision.',
          mjmlTemplate: null
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'reeng_1', target: 'conditional_1' },
      {
        id: 'e2',
        source: 'conditional_1',
        target: 'delay_opened',
        sourceHandle: 'true'
      },
      {
        id: 'e3',
        source: 'conditional_1',
        target: 'delay_not_opened',
        sourceHandle: 'false'
      },
      { id: 'e4', source: 'delay_opened', target: 'engaged_email' },
      { id: 'e5', source: 'delay_not_opened', target: 'last_chance' }
    ]
  }
}

// Get list of templates for dropdown
export const getTemplateList = () => {
  return Object.entries(campaignTemplates).map(([key, template]) => ({
    value: key,
    label: template.name,
    description: template.description,
    nodeCount: template.nodes.length
  }))
}

// Load template data
export const loadTemplate = (templateKey) => {
  const template = campaignTemplates[templateKey]
  if (!template) {
    console.error(`Template ${templateKey} not found`)
    return null
  }

  return {
    nodes: template.nodes,
    edges: template.edges
  }
}
