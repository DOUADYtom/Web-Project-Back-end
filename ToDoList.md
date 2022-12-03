# Back end Discover

1. - [x] User creation, Public
2. - [x] User delete, Private to concerned user and admin
3. - [x] User update, Private to concerned user

4. - [x] Monument creation, Private to creator
5. - [x] Monument delete, Private to concerned creator and admin
6. - [x] Monument update, Private to concerned creator and admin
7. - [x] Monument get, Public
8. - [x] Monument get filtered, Public
9. - [ ] Search Monument by everything sort them by most Relevant, Public
10. - [ ] Search Monument where tag is close to another Monument, Public 

10. - [x] Review creation, Private to user
11. - [x] Review delete, Private to concerned user and admin
12. - [x] Review update, Private to concerned user and admin
13. - [x] Review get by user, Private to concerned user and admin
14. - [x] Review get by monument, Public

15. - [x] User add to be visited monument, Private to user
16. - [x] User add already visited monument, Private to user
17. - [x] User delete to be visited monument, Private to user
18. - [x] User delete already visited monument, Private to user
19. - [x] To be visited monument get by user, Private to user
20. - [x] Already visited monument get by user, Private to user
21. - [x] Name get by user, Private to user.

update la moyenne de monument à chaque ajout de review : furmule : (monument.avgRating * monument.nbReviews + review.newRating) / (monument.nbReviews + 1)
page d'accueil : 
    limité à 10 monuments, 
    parametre de query (limit=10), 
    sort by mostViewed, mostLiked, mostRecent, mustVisited, mustToBeVisited, mostTrend(mostToBeVisited du dernier mois).