import {Injectable, InternalServerErrorException, NotFoundException} from "@nestjs/common";
import {CategoryEntity} from "./models/entities/category.entity";
import {DifficultyEntity} from "./models/entities/difficulty.entity";

@Injectable()
export class QuizService{
    constructor(

    ){}

    async createQuiz(questionCount: number, categoryId?: number, difficultyId?: number){
        return await this.getQuestions(questionCount, categoryId, difficultyId);
    }

    private async getQuestions(questionCount: number, categoryId?: number, difficultyId?: number){
        let categoryOption = "";
        if(categoryId)
            categoryOption = `&category=${categoryId}`;
        let difficultyOption = "";
        if(difficultyId){
            const difficultyName = this.getDifficulties().find(difficulty => difficulty.id === difficultyId).name;
            if(!difficultyName)
                throw new NotFoundException("Difficulty not found");
            difficultyOption = `&difficulty=${difficultyName.toLowerCase()}`;
        }
        try{
            const res = await fetch(`https://opentdb.com/api.php?amount=${questionCount}${categoryOption}${difficultyOption}`);
            const data = await res.json();
            return data.results;
        }catch (e){
            throw new InternalServerErrorException(e);
        }
    }

    async getCategories(): Promise<CategoryEntity[]>{
        try{
            const res = await fetch("https://opentdb.com/api_category.php");
            const data = await res.json();
            return data.trivia_categories;
        }catch (e){
            throw new InternalServerErrorException(e);
        }

    }

    getDifficulties(): DifficultyEntity[]{
        return [
            {
                id: 1,
                name: "Easy"
            },
            {
                id: 2,
                name: "Medium"
            },
            {
                id: 3,
                name: "Hard"
            }
        ];
    }
}
