import React, { useState } from "react";
import { X } from "lucide-react";

const destinations = [
  {
    id: "kilimanjaro",
    title: "Kilimanjaro",
    subtitle: "A majestic horizon of wonder",
    image: "/images/kev-kilimanjaro.jpg",
    content:
      "Few sights feel as unforgettable as Kilimanjaro rising above the clouds. Its snow-capped summit, wide skies and surrounding plains create one of East Africa’s most iconic travel scenes. For many travellers, Kilimanjaro is not just a mountain; it is a symbol of ambition, stillness and awe. The region offers remarkable photography, nature walks, cultural encounters and access to safari circuits that combine beautifully with a longer regional holiday. Whether viewed at sunrise, from a scenic flight path or from nearby lodges, Kilimanjaro gives every journey a sense of grandeur. It is ideal for travellers seeking adventure, reflection and landscapes that feel almost unreal.",
  },
  {
    id: "lamu",
    title: "Lamu",
    subtitle: "Soft coastlines, old-world charm and island calm",
    image: "/images/kev-lamu.jpg",
    content:
      "Lamu is one of Kenya’s most enchanting coastal escapes, known for its narrow streets, Swahili architecture, dhow sails and slow island rhythm. The island invites travellers to trade noise for stillness and routine for warm ocean air. Its heritage-rich old town, peaceful beaches and golden sunsets make it perfect for romantic breaks, cultural exploration and quiet retreats. Visitors can enjoy seafood, sailing, beach walks, local crafts and the feeling of stepping into a gentler, more poetic world. Lamu is especially appealing to travellers who want a destination with soul: beautiful, historic, relaxed and deeply memorable.",
  },
  {
    id: "eldoret",
    title: "Highland Retreats",
    subtitle: "Cool air, green landscapes and calm escapes",
    image: "/images/kev-eldoret.jpg",
    content:
      "Kenya’s highland retreats offer a refreshing contrast to the coast and city. Around Eldoret and the wider highland region, travellers discover cool weather, open farms, rolling landscapes and a quieter pace of life. The area is closely associated with athletics, outdoor living and scenic countryside, making it ideal for wellness breaks, family visits, sports tourism and peaceful weekend escapes. The highlands are perfect for travellers who enjoy fresh air, soft mornings, local hospitality and less crowded experiences. It is a destination style that feels grounding, restorative and proudly Kenyan.",
  },
  {
    id: "maasai-mara",
    title: "Maasai Mara",
    subtitle: "Wild beauty and unforgettable safari moments",
    image: "/images/kev-maasai-mara.jpg",
    content:
      "The Maasai Mara is one of Africa’s most celebrated safari destinations, famous for sweeping savannahs, extraordinary wildlife and dramatic skies. It is home to lions, elephants, cheetahs, giraffes, buffalo and countless other species, with the Great Migration standing as one of nature’s most breathtaking spectacles. Beyond wildlife, the Mara offers sunrise game drives, luxury camps, cultural encounters and evenings under vast star-filled skies. It is a destination that feels cinematic, emotional and deeply alive. For travellers seeking wonder, photography, romance or family adventure, the Maasai Mara remains one of Kenya’s most powerful reasons to travel.",
  },
];

export default function DestinationGallery() {
  const [selectedDestination, setSelectedDestination] = useState(null);

  function closeModal() {
    setSelectedDestination(null);
  }

  return (
    <section className="section destination-showcase">
      <div className="container">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Explore Kenya and beyond</p>
            <h2>Destinations that stay with you</h2>
          </div>

          <p>
            Select a destination and discover the places, landscapes and moments
            that make every journey worth planning.
          </p>
        </div>

        <div className="destination-grid">
          {destinations.map((destination) => (
            <button
              key={destination.id}
              type="button"
              className="destination-card"
              onClick={() => setSelectedDestination(destination)}
              aria-label={`Explore ${destination.title}`}
            >
              <img src={destination.image} alt={destination.title} />

              <div className="destination-card-overlay">
                <p className="eyebrow">Discover</p>
                <h3>{destination.title}</h3>
                <span>{destination.subtitle}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedDestination && (
        <div
          className="destination-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="destination-modal-title"
          onClick={closeModal}
        >
          <article
            className="destination-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="destination-modal-close"
              onClick={closeModal}
              aria-label="Close destination details"
            >
              <X size={20} />
            </button>

            <div className="destination-modal-image-wrap">
              <img
                src={selectedDestination.image}
                alt={selectedDestination.title}
              />
            </div>

            <div className="destination-modal-content">
              <p className="eyebrow">Featured escape</p>

              <h2 id="destination-modal-title">
                {selectedDestination.title}
              </h2>

              <h3>{selectedDestination.subtitle}</h3>

              <p>{selectedDestination.content}</p>

              <button
                type="button"
                className="primary-button"
                onClick={closeModal}
              >
                Continue exploring
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}