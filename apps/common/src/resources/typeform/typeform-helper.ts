import { titleToQuizType } from './typeform-quiz-types';

export interface ITypeformAnswer { questionId: string, questionText: string, answerType: string, answerText: string }

export class TypeformHelper {
    static getQuizType(body: any): number | null {
        return titleToQuizType[body?.form_response?.definition?.title] || null;
    }

    static getQuizName(body: any): string {
        return body?.form_response?.definition?.title;
    }

    static getUserEmail(body: any): string {
        const answersArray: any[] = body?.form_response?.answers;

        if (!answersArray) {
            return null;
        }

        const answer = answersArray.find(answer => answer.type === 'email');

        return answer?.email;
    }

    static getFormId(body: any): string {
        return body?.form_response?.form_id;
    }

    static getAnswers(body: any): ITypeformAnswer[] {
        const answers = [];
        const bodyAnswers = body?.form_response?.answers;

        if (!bodyAnswers) {
            return answers;
        }

        bodyAnswers.forEach(answer => {
            const result: any = {};
            if (answer.type === 'choice') {
                result.answerText = answer?.choice?.label;
            } else if (answer.type === 'email') {
                result.answerText = answer?.email;
            } else {
                result.answerText = answer?.text;
            }

            result.questionId = answer?.field?.id;
            result.answerType = answer?.type;

            answers.push(result);
        });

        const questionsMap = {};
        body?.form_response?.definition?.fields.forEach(field => {
            questionsMap[field.id] = field;
        });

        answers.forEach(answer => {
            answer.questionText = questionsMap[answer.questionId].title;
        });

        return answers;
    }
}