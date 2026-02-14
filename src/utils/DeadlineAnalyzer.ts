import { DeadlineType, Priority } from '../models/types';
import { DeadlineService } from '../services/DeadlineService';

/**
 * Deadline Analyzer
 * Analyzes matter files and automatically extracts deadline information
 */
export class DeadlineAnalyzer {
  private deadlineService: DeadlineService;

  // Patterns for detecting deadlines in text
  private readonly deadlinePatterns = {
    filing: /filing\s+(?:deadline|due|date).*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
    hearing: /hearing\s+(?:date|scheduled).*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
    response: /response\s+(?:due|deadline).*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
    renewal: /(?:renewal|renew)\s+(?:by|before|deadline).*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
    expiry: /(?:expires?|expiry|expiration).*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
    generalDate: /(?:deadline|due date|by).*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi
  };

  constructor(deadlineService: DeadlineService) {
    this.deadlineService = deadlineService;
  }

  /**
   * Analyze matter file content and extract deadlines
   */
  analyzeMatterFile(
    matterId: string,
    fileContent: string,
    fileName: string
  ): Array<{ type: DeadlineType; date: Date; context: string }> {
    const extractedDeadlines: Array<{ type: DeadlineType; date: Date; context: string }> = [];

    // Extract filing deadlines
    const filingMatches = this.extractDates(fileContent, this.deadlinePatterns.filing);
    filingMatches.forEach(match => {
      extractedDeadlines.push({
        type: DeadlineType.FILING,
        date: match.date,
        context: match.context
      });
    });

    // Extract hearing dates
    const hearingMatches = this.extractDates(fileContent, this.deadlinePatterns.hearing);
    hearingMatches.forEach(match => {
      extractedDeadlines.push({
        type: DeadlineType.HEARING,
        date: match.date,
        context: match.context
      });
    });

    // Extract response deadlines
    const responseMatches = this.extractDates(fileContent, this.deadlinePatterns.response);
    responseMatches.forEach(match => {
      extractedDeadlines.push({
        type: DeadlineType.RESPONSE_DUE,
        date: match.date,
        context: match.context
      });
    });

    // Extract renewal deadlines
    const renewalMatches = this.extractDates(fileContent, this.deadlinePatterns.renewal);
    renewalMatches.forEach(match => {
      extractedDeadlines.push({
        type: DeadlineType.RENEWAL,
        date: match.date,
        context: match.context
      });
    });

    // Extract expiry dates
    const expiryMatches = this.extractDates(fileContent, this.deadlinePatterns.expiry);
    expiryMatches.forEach(match => {
      extractedDeadlines.push({
        type: DeadlineType.LICENCE_EXPIRY,
        date: match.date,
        context: match.context
      });
    });

    return extractedDeadlines;
  }

  /**
   * Automatically create deadlines from analyzed content
   */
  autoCreateDeadlines(
    matterId: string,
    fileContent: string,
    fileName: string
  ): number {
    const extractedDeadlines = this.analyzeMatterFile(matterId, fileContent, fileName);
    let createdCount = 0;

    for (const extracted of extractedDeadlines) {
      // Only create deadlines for future dates
      if (extracted.date > new Date()) {
        const priority = this.determinePriority(extracted.type, extracted.date);
        
        this.deadlineService.createDeadline(
          matterId,
          extracted.type,
          `${extracted.type} - Auto-detected from ${fileName}`,
          extracted.context,
          extracted.date,
          priority
        );
        
        createdCount++;
      }
    }

    return createdCount;
  }

  /**
   * Analyze business licence document
   */
  analyzeLicenceDocument(content: string): {
    licenceNumber?: string;
    issueDate?: Date;
    expiryDate?: Date;
    licenceType?: string;
  } {
    const result: {
      licenceNumber?: string;
      issueDate?: Date;
      expiryDate?: Date;
      licenceType?: string;
    } = {};

    // Extract licence number
    const licenceNumberMatch = content.match(/(?:licence|license)\s+(?:no|number|#):?\s*([A-Z0-9\-]+)/i);
    if (licenceNumberMatch) {
      result.licenceNumber = licenceNumberMatch[1];
    }

    // Extract licence type
    const typeMatch = content.match(/(?:type|category):\s*([A-Za-z\s]+)/i);
    if (typeMatch) {
      result.licenceType = typeMatch[1].trim();
    }

    // Extract issue date
    const issueDateMatch = content.match(/(?:issue|issued|grant)(?:d|ed)?\s+(?:date|on)?:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (issueDateMatch) {
      const parsedDate = this.parseDate(issueDateMatch[1]);
      if (parsedDate) result.issueDate = parsedDate;
    }

    // Extract expiry date
    const expiryMatches = this.extractDates(content, this.deadlinePatterns.expiry);
    if (expiryMatches.length > 0) {
      result.expiryDate = expiryMatches[0].date;
    }

    return result;
  }

  /**
   * Analyze registration document
   */
  analyzeRegistrationDocument(content: string): {
    registrationNumber?: string;
    registrationDate?: Date;
    expiryDate?: Date;
    registrationType?: string;
  } {
    const result: {
      registrationNumber?: string;
      registrationDate?: Date;
      expiryDate?: Date;
      registrationType?: string;
    } = {};

    // Extract registration number
    const regNumberMatch = content.match(/registration\s+(?:no|number|#):?\s*([A-Z0-9\-]+)/i);
    if (regNumberMatch) {
      result.registrationNumber = regNumberMatch[1];
    }

    // Extract registration type
    const typeMatch = content.match(/(?:type|class):\s*([A-Za-z\s]+)/i);
    if (typeMatch) {
      result.registrationType = typeMatch[1].trim();
    }

    // Extract registration date
    const regDateMatch = content.match(/registration\s+date:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (regDateMatch) {
      const parsedDate = this.parseDate(regDateMatch[1]);
      if (parsedDate) result.registrationDate = parsedDate;
    }

    // Extract expiry date
    const expiryMatches = this.extractDates(content, this.deadlinePatterns.expiry);
    if (expiryMatches.length > 0) {
      result.expiryDate = expiryMatches[0].date;
    }

    return result;
  }

  private extractDates(
    content: string,
    pattern: RegExp
  ): Array<{ date: Date; context: string }> {
    const matches: Array<{ date: Date; context: string }> = [];
    let match;

    // Reset the pattern's lastIndex
    pattern.lastIndex = 0;

    while ((match = pattern.exec(content)) !== null) {
      const dateStr = match[1];
      const parsedDate = this.parseDate(dateStr);
      
      if (parsedDate) {
        // Get surrounding context (50 chars before and after)
        const startIdx = Math.max(0, match.index - 50);
        const endIdx = Math.min(content.length, match.index + match[0].length + 50);
        const context = content.substring(startIdx, endIdx).trim();

        matches.push({
          date: parsedDate,
          context
        });
      }
    }

    return matches;
  }

  private parseDate(dateStr: string): Date | null {
    // Try various date formats
    const formats = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,  // MM/DD/YYYY or DD/MM/YYYY
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/    // MM/DD/YY or DD/MM/YY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let month = parseInt(match[1], 10);
        let day = parseInt(match[2], 10);
        let year = parseInt(match[3], 10);

        // Handle 2-digit years
        if (year < 100) {
          year += 2000;
        }

        // Swap if day > 12 (assume DD/MM format)
        if (day > 12) {
          [month, day] = [day, month];
        }

        // Validate date components
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
    }

    return null;
  }

  private determinePriority(type: DeadlineType, dueDate: Date): Priority {
    const daysUntil = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Critical deadlines
    if (type === DeadlineType.FILING || type === DeadlineType.HEARING) {
      return Priority.CRITICAL;
    }

    // Priority based on time until deadline
    if (daysUntil <= 7) {
      return Priority.CRITICAL;
    } else if (daysUntil <= 14) {
      return Priority.HIGH;
    } else if (daysUntil <= 30) {
      return Priority.MEDIUM;
    } else {
      return Priority.LOW;
    }
  }
}
