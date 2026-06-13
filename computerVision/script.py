from ultralytics import YOLO

def main():
    ### Instantiate the model ###
    model = YOLO("yolo26n.pt")

    ### Fire up the training process ###
    results = model.train(
        data="data.yaml",
        workers=0,
        batch=4,
        epochs=100,
        imgsz=640,
        device=0,
        patience=20
    )

if __name__ == "__main__":
    main()