import ModuleTitle from "@/components/elements/ModuleTitle";
import ModuleBody from "@/components/elements/ModuleBody";

import Textarea from "@/components/elements/Textarea";
import Toggles from "@/components/elements/Toggles";

export default function PromptRandomizer() {
    return (
        <div>
            <ModuleTitle label="Prompt Randomizer" />

            <ModuleBody>
                <Textarea configKey="prompt_beg" label="Begining Prompt" placeholder="Tags to put at the beginning" autocomplete="on" height="112px"/>
                <Textarea configKey="prompt_search" label="Search Tags" placeholder="Tags to search for the prompt randomization" autocomplete="on" height="80px"/>
                
                <Toggles items={[
                    { key: "remove_artist", icon: "paint-brush-fill", x: true, label: "Remove\nArtist" },
                    { key: "remove_copyright", icon: "book-4-fill", x: true, label: "Remove\nCopyright" },
                    { key: "remove_character", icon: "user-3-fill", x: true, label: "Remove\nCharacter" }
                ]}/>

                <Toggles items={[
                    { key: "remove_characteristic", icon: "bear-fill", x: true, label: "Remove\nCharacteristic" },
                    { key: "remove_attire", icon: "hat-fill", x: true, label: "Remove\nAttire" },
                    { key: "remove_nsfw", icon: "body-line", x: true, label: "Remove\nNSFW" }
                ]}/>

                <Toggles items={[
                    { key: "remove_ornament", icon: "diamond_2_line", x: true, label: "Remove\nOrnament" },
                    { key: "remove_emotion", icon: "happy_line", x: true, label: "Remove\nEmotion" },
                    { key: "remove_ratings", icon: "alert_line", x: true, label: "Remove\nRatings" },
                ]}/>

                <Textarea configKey="prompt_end" label="End Prompt" placeholder="Tags to put at the end" autocomplete="on" height="80px"/>
                <Textarea configKey="negative" label="Negative Prompt" placeholder="Tags to exclude" autocomplete="on" height="112px"/>
            </ModuleBody>
        </div>
    );
}