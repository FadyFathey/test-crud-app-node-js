import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'node:fs';
const program = new Command();



program
  .name('courses-management-system')
  .description('CLI to add courses ')
  .version('1.0.0');



program.command('add')
  .description('Add a course')
  .action(() => {
    inquirer
      .prompt([
        {
          type: 'input',
          name: "course_name",
          message: "what is your course name"
        },
        {
          type: 'input',
          name: "price",
          message: "what is your course price"
        },
      ])
      .then((answers) => {
        console.log(answers);
        fs.writeFile('./course.json', JSON.stringify(answers), 'utf-8', () => {
          console.log(' add course Done');
        });

      })

  })

program.parse(process.argv)