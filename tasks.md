## Error handling for he parser (X)

sort of done

## Assignment (X)

-   grammar change, now assignment is squizzed between expression and equality:
    assignment -> IDENTIFIER "=" assignment | equality
-   generate AST classes for assignment expression (X)

now to the assignment parsing
first we call equality(), since it will return an identifier (after descending all the way down)

then we check if there's an equal sign
if so, store the equal sign token
then parse the expression which is being assigned, by
recursivly calling assignment

finally, if the identifier that we've parsed is of type variable, return the new Assignment class

DONE

## Blocks

-   Add an enclosing member to the enviroment, so envisorments get nested in each other, so we can traverse them to get to the needed scope
