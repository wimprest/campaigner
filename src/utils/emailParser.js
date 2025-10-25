// Parse bulk email import format
// Format:
// === EMAIL START ===
// TITLE: Email title
// DESCRIPTION: Description text (markdown supported)
// SUBJECT_A: First subject line
// SUBJECT_B: Second subject line (optional)
// SUBJECT_C: Third subject line (optional)
// CONTENT:
// <p>HTML email content...</p>
// NOTES: Internal notes (markdown supported)
// === EMAIL END ===

export function parseBulkEmails(text) {
  const emails = []
  const errors = []

  // Split by email delimiters
  const emailBlocks = text.split(/===\s*EMAIL\s+START\s*===/).filter(block => block.trim())

  emailBlocks.forEach((block, index) => {
    try {
      // Check for END delimiter
      if (!block.includes('=== EMAIL END ===')) {
        errors.push(`Email ${index + 1}: Missing === EMAIL END === delimiter`)
        return
      }

      // Remove END delimiter
      const content = block.split('=== EMAIL END ===')[0].trim()

      // Parse fields
      const email = {
        title: '',
        description: '',
        subjectA: '',
        subjectB: '',
        subjectC: '',
        content: '',
        notes: ''
      }

      // Extract TITLE
      const titleMatch = content.match(/^TITLE:\s*(.+?)$/m)
      if (titleMatch) {
        email.title = titleMatch[1].trim()
      } else {
        errors.push(`Email ${index + 1}: Missing TITLE field`)
        return
      }

      // Extract DESCRIPTION (optional, can be multiline until next field)
      const descMatch = content.match(/DESCRIPTION:\s*([\s\S]*?)(?=SUBJECT_[ABC]:|CONTENT:|NOTES:|$)/i)
      if (descMatch) {
        email.description = descMatch[1].trim()
      }

      // Extract SUBJECT_A (required)
      const subjectAMatch = content.match(/SUBJECT_A:\s*(.+?)$/m)
      if (subjectAMatch) {
        email.subjectA = subjectAMatch[1].trim()
      } else {
        errors.push(`Email ${index + 1}: Missing SUBJECT_A field`)
        return
      }

      // Extract SUBJECT_B (optional)
      const subjectBMatch = content.match(/SUBJECT_B:\s*(.+?)$/m)
      if (subjectBMatch) {
        email.subjectB = subjectBMatch[1].trim()
      }

      // Extract SUBJECT_C (optional)
      const subjectCMatch = content.match(/SUBJECT_C:\s*(.+?)$/m)
      if (subjectCMatch) {
        email.subjectC = subjectCMatch[1].trim()
      }

      // Extract CONTENT (required, multiline until NOTES or end)
      const contentMatch = content.match(/CONTENT:\s*([\s\S]*?)(?=NOTES:|$)/i)
      if (contentMatch) {
        email.content = contentMatch[1].trim()
        if (!email.content) {
          errors.push(`Email ${index + 1}: CONTENT field is empty`)
          return
        }
      } else {
        errors.push(`Email ${index + 1}: Missing CONTENT field`)
        return
      }

      // Extract NOTES (optional, multiline until end)
      const notesMatch = content.match(/NOTES:\s*([\s\S]*?)$/i)
      if (notesMatch) {
        email.notes = notesMatch[1].trim()
      }

      emails.push(email)
    } catch (error) {
      errors.push(`Email ${index + 1}: Parse error - ${error.message}`)
    }
  })

  return { emails, errors }
}

// Convert parsed emails to campaign nodes
export function convertEmailsToNodes(emails, startPosition = { x: 100, y: 100 }, startId = 0) {
  const nodes = []
  const verticalSpacing = 200

  emails.forEach((email, index) => {
    // Build subject variants array
    const subjectVariants = []

    if (email.subjectA) {
      subjectVariants.push({
        id: 'A',
        subject: email.subjectA,
        weight: email.subjectB || email.subjectC ? 33 : 100
      })
    }

    if (email.subjectB) {
      subjectVariants.push({
        id: 'B',
        subject: email.subjectB,
        weight: email.subjectC ? 33 : 50
      })
    }

    if (email.subjectC) {
      subjectVariants.push({
        id: 'C',
        subject: email.subjectC,
        weight: 34
      })
    }

    const node = {
      id: `node_${startId + index}`,
      type: 'email',
      position: {
        x: startPosition.x,
        y: startPosition.y + (index * verticalSpacing)
      },
      data: {
        label: email.title,
        description: email.description,
        subject: email.subjectA, // Legacy field for backward compatibility
        subjectVariants: subjectVariants,
        emailContent: email.content,
        notes: email.notes,
        emailTemplate: 'blank', // Default template
        mjmlTemplate: '' // Empty - user can select template later
      }
    }

    nodes.push(node)
  })

  return nodes
}
