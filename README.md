# Referencing form 

## Install

Run `npm i`  

Start dev server with `npm start`  


## Considerations

- There are a lot of cases to consider for error checking, for instance start date is not checked to be previous to end date
- I'm not fully validating the form for completeness, I assume that all fields are optional
- Error message is very poor
- Cancel button doesn't do anything
- Test suite is incomplete
- Components and utils should be extracted to its own files
- The _add another employer_ button appears when the user tries to click submit
- User experience is not good, the user doesn't receive enough feedback about what's going on
