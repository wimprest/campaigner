// MJML Email Templates Library

export const emailTemplates = {
  blank: {
    name: 'Blank',
    description: 'Start from scratch',
    mjml: `<mjml>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif">
          Your content here...
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
  },

  welcome: {
    name: 'Welcome Email',
    description: 'Friendly welcome message',
    mjml: `<mjml>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text font-size="24px" color="#1a1a1a" font-family="Arial, sans-serif" font-weight="bold" align="center">
          Welcome to Our Community!
        </mj-text>
        <mj-divider border-color="#e0e0e0" padding="10px 0"></mj-divider>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          Hi {{firstName}},
        </mj-text>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          We're thrilled to have you on board! Thank you for joining us. We're committed to providing you with the best experience possible.
        </mj-text>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          Here's what you can do next:
        </mj-text>
        <mj-list>
          <mj-li font-size="14px" color="#555555" padding="5px 0">Complete your profile</mj-li>
          <mj-li font-size="14px" color="#555555" padding="5px 0">Explore our resources</mj-li>
          <mj-li font-size="14px" color="#555555" padding="5px 0">Connect with our community</mj-li>
        </mj-list>
        <mj-button background-color="#4CAF50" color="#ffffff" href="{{ctaLink}}" font-size="16px" border-radius="5px" padding="20px 0">
          Get Started
        </mj-button>
        <mj-text font-size="14px" color="#666666" font-family="Arial, sans-serif" line-height="1.6" padding-top="20px">
          If you have any questions, feel free to reply to this email. We're here to help!
        </mj-text>
        <mj-text font-size="14px" color="#666666" font-family="Arial, sans-serif">
          Best regards,<br/>
          The Team
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#f4f4f4" padding="20px">
      <mj-column>
        <mj-text font-size="12px" color="#999999" align="center">
          © 2025 Your Company. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
  },

  announcement: {
    name: 'Announcement',
    description: 'Product update or news',
    mjml: `<mjml>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#2196F3" padding="20px">
      <mj-column>
        <mj-text font-size="28px" color="#ffffff" font-family="Arial, sans-serif" font-weight="bold" align="center">
          Exciting News!
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="30px">
      <mj-column>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          Hi {{firstName}},
        </mj-text>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          We have something exciting to share with you!
        </mj-text>
        <mj-text font-size="18px" color="#1a1a1a" font-family="Arial, sans-serif" font-weight="bold" padding="10px 0">
          {{announcementTitle}}
        </mj-text>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          {{announcementBody}}
        </mj-text>
        <mj-button background-color="#2196F3" color="#ffffff" href="{{ctaLink}}" font-size="16px" border-radius="5px" padding="20px 0">
          Learn More
        </mj-button>
      </mj-column>
    </mj-section>
    <mj-section background-color="#f4f4f4" padding="20px">
      <mj-column>
        <mj-text font-size="12px" color="#999999" align="center">
          © 2025 Your Company. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
  },

  survey: {
    name: 'Survey Request',
    description: 'Ask for customer feedback',
    mjml: `<mjml>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="30px">
      <mj-column>
        <mj-text font-size="24px" color="#1a1a1a" font-family="Arial, sans-serif" font-weight="bold" align="center">
          We'd Love Your Feedback
        </mj-text>
        <mj-divider border-color="#e0e0e0" padding="15px 0"></mj-divider>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          Hi {{firstName}},
        </mj-text>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          Your opinion matters to us! We'd appreciate if you could take a moment to share your thoughts.
        </mj-text>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6" padding="10px 0">
          <strong>{{surveyQuestion}}</strong>
        </mj-text>
        <mj-button background-color="#FF9800" color="#ffffff" href="{{surveyLink}}" font-size="16px" border-radius="5px" padding="20px 0">
          Take Survey (2 minutes)
        </mj-button>
        <mj-text font-size="14px" color="#666666" font-family="Arial, sans-serif" line-height="1.6" padding-top="20px">
          Thank you for helping us improve!
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#f4f4f4" padding="20px">
      <mj-column>
        <mj-text font-size="12px" color="#999999" align="center">
          © 2025 Your Company. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
  },

  promotional: {
    name: 'Promotional',
    description: 'Special offer or discount',
    mjml: `<mjml>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#E91E63" padding="30px">
      <mj-column>
        <mj-text font-size="32px" color="#ffffff" font-family="Arial, sans-serif" font-weight="bold" align="center">
          SPECIAL OFFER
        </mj-text>
        <mj-text font-size="20px" color="#ffffff" font-family="Arial, sans-serif" align="center">
          {{discountAmount}} OFF
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="30px">
      <mj-column>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          Hi {{firstName}},
        </mj-text>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          For a limited time only, enjoy {{discountAmount}} off your next purchase!
        </mj-text>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          {{promoDetails}}
        </mj-text>
        <mj-text font-size="14px" color="#E91E63" font-family="Arial, sans-serif" font-weight="bold" align="center" padding="10px 0">
          Use code: {{promoCode}}
        </mj-text>
        <mj-button background-color="#E91E63" color="#ffffff" href="{{ctaLink}}" font-size="18px" border-radius="5px" padding="20px 0">
          Shop Now
        </mj-button>
        <mj-text font-size="12px" color="#999999" font-family="Arial, sans-serif" align="center" padding-top="15px">
          *Offer expires {{expiryDate}}
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#f4f4f4" padding="20px">
      <mj-column>
        <mj-text font-size="12px" color="#999999" align="center">
          © 2025 Your Company. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
  },

  reengagement: {
    name: 'Re-engagement',
    description: 'Win back inactive users',
    mjml: `<mjml>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="30px">
      <mj-column>
        <mj-text font-size="24px" color="#1a1a1a" font-family="Arial, sans-serif" font-weight="bold" align="center">
          We Miss You!
        </mj-text>
        <mj-divider border-color="#e0e0e0" padding="15px 0"></mj-divider>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          Hi {{firstName}},
        </mj-text>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          It's been a while since we last saw you, and we wanted to reach out. We've made some exciting improvements since your last visit!
        </mj-text>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          Here's what's new:
        </mj-text>
        <mj-list>
          <mj-li font-size="14px" color="#555555" padding="5px 0">{{update1}}</mj-li>
          <mj-li font-size="14px" color="#555555" padding="5px 0">{{update2}}</mj-li>
          <mj-li font-size="14px" color="#555555" padding="5px 0">{{update3}}</mj-li>
        </mj-list>
        <mj-button background-color="#9C27B0" color="#ffffff" href="{{ctaLink}}" font-size="16px" border-radius="5px" padding="20px 0">
          Come Back & Explore
        </mj-button>
        <mj-text font-size="14px" color="#666666" font-family="Arial, sans-serif" line-height="1.6" padding-top="20px">
          We'd love to have you back. If there's anything we can do to improve your experience, please let us know!
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#f4f4f4" padding="20px">
      <mj-column>
        <mj-text font-size="12px" color="#999999" align="center">
          © 2025 Your Company. All rights reserved.<br/>
          <a href="{{unsubscribeLink}}" style="color: #999999;">Unsubscribe</a>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
  }
}

// Helper function to get template list for dropdown
export const getTemplateList = () => {
  return Object.entries(emailTemplates).map(([key, template]) => ({
    value: key,
    label: template.name,
    description: template.description
  }))
}

// Helper function to convert MJML to HTML
export const convertMjmlToHtml = (mjmlString) => {
  try {
    // Note: This will be handled server-side or with mjml library
    // For now, return the MJML as-is
    // In production, you'd use: mjml2html(mjmlString).html
    return mjmlString
  } catch (error) {
    console.error('MJML conversion error:', error)
    return null
  }
}
