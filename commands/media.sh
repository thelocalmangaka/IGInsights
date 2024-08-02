# Store media.csv contents into an array
medias=()
while read -r line
do
  medias+=("$line")
done < ./files/media.csv

# Perform GET curl on every permalink, and search HTML output for insight ID
# and store insight URLs into ./files/insights.csv

# Clear insights.csv
: > ./files/insights.csv
numReels="${#medias[@]}"
i=1
for media in "${medias[@]}"
do
    # Read media info into array
    IFS=',' read -ra mediaInfo <<< "$media"
    timestamp="${mediaInfo[0]}"
    mediaType="${mediaInfo[1]}"
    permalink="${mediaInfo[2]}"
    # curl permalink for info
    echo "Grabbing insight $i of $numReels..."
    i=$((i+1))
    curl -s "$permalink" > ./files/html_dump.txt
    mediaId=$(grep -o '"media_id":"\d*"' < ./files/html_dump.txt | head -1)
    insightId=$(grep -o '\d*' <<< "$mediaId")
    echo "$timestamp,$mediaType,$insightId" >> ./files/insights.csv
    # Clear html_dump.txt
    : > ./files/html_dump.txt
done

# remove trailing newline character at end of file
truncate -s -1 ./files/insights.csv
echo "Insight ID's retrieved and written to file."