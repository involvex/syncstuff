import "./ExploreContainer.css";

interface ContainerProps {
  name: string;
}

const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <div className="container">
      <strong>{name}</strong>
      <p>
        Explore{" "}
        <a
          href="https://ionicframework.com/docs/components"
          rel="noopener noreferrer"
          target="_blank"
        >
          UI Components
        </a>
      </p>
    </div>
  );
};

export default ExploreContainer;
